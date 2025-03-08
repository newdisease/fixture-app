import { type User } from '@prisma/client'
import { createCookieSessionStorage, redirect } from 'react-router'
import { Authenticator } from 'remix-auth'

import { TOTPStrategy } from 'remix-auth-totp'
import { sendAuthEmail } from '../email/templates/auth-email'
import { GoogleStrategy } from './google-strategy'

import { ROUTE_PATH as FEED_PATH } from '~/routes/_app.feed'
import { ROUTE_PATH as GOOGLE_CALLBACK_PATH } from '~/routes/_auth.google.callback'
import { ROUTE_PATH as LOGOUT_PATH } from '~/routes/_auth.logout'
import { ROUTE_PATH as MAGIC_LINK_PATH } from '~/routes/_auth.magic-link'
import { ROUTE_PATH as AUTH_VERIFY_PATH } from '~/routes/_auth.verify-code'
import { ROUTE_PATH as SET_USERNAME_PATH } from '~/routes/_onboarding.username'
import { ERRORS } from '~/utils/constants/errors'
import { prisma } from '~/utils/db.server'
import { HOST_URL } from '~/utils/misc.server'

export type SessionUser = Pick<User, 'id'>

export const AUTH_SESSION_KEY = '_session'
export const TOTP_COOKIE_KEY = '_totp'

export const authSessionStorage = createCookieSessionStorage({
	cookie: {
		name: AUTH_SESSION_KEY,
		path: '/',
		sameSite: 'lax',
		httpOnly: true,
		secrets: [process.env.SESSION_SECRET],
		secure: process.env.NODE_ENV === 'production',
	},
})

export const authenticator = new Authenticator<SessionUser>()

/**
 * Google - Strategy.
 */

authenticator.use(
	new GoogleStrategy<SessionUser>(
		{
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			redirectURI: `${HOST_URL}${GOOGLE_CALLBACK_PATH}`,
		},
		async ({ tokens }) => {
			const profile = await GoogleStrategy.userProfile(tokens)
			const email = profile.emails[0].value
			let user = await prisma.user.findUnique({
				where: { email },
				include: {
					image: { select: { id: true } },
				},
			})
			if (!user) {
				let imageBlob: Buffer | null = null
				if (profile.photos && profile.photos.length > 0) {
					try {
						const response = await fetch(profile.photos[0].value)
						if (!response.ok) {
							throw new Error('Failed to fetch profile picture')
						}
						const arrayBuffer = await response.arrayBuffer()
						imageBlob = Buffer.from(arrayBuffer)
					} catch (error) {
						console.error('Failed to fetch profile picture', error)
					}
				}

				user = await prisma.user.create({
					data: {
						email,
						fullName: profile.displayName,
						image: imageBlob
							? {
									create: {
										altText: `Profile picture ${profile.displayName}`,
										contentType: 'image/jpeg',
										blob: imageBlob,
									},
								}
							: undefined,
					},
					include: {
						image: { select: { id: true } },
					},
				})
				if (!user) throw new Error(ERRORS.AUTH_USER_NOT_CREATED)
			}

			return { id: user.id }
		},
	),
)

/**
 * TOTP - Strategy.
 */
authenticator.use(
	new TOTPStrategy<SessionUser>(
		{
			secret: process.env.ENCRYPTION_SECRET,
			magicLinkPath: MAGIC_LINK_PATH,
			emailSentRedirect: AUTH_VERIFY_PATH,
			successRedirect: FEED_PATH,
			failureRedirect: AUTH_VERIFY_PATH,
			sendTOTP: async ({ email, code, magicLink }) => {
				if (process.env.NODE_ENV === 'development') {
					// Development Only: Log the TOTP code.
					console.log('[ Dev-Only ] TOTP Code:', code)
				}
				await sendAuthEmail({ email, code, magicLink })
			},
		},
		async ({ email, request }) => {
			let user = await prisma.user.findUnique({
				where: { email },
				include: {
					image: { select: { id: true } },
				},
			})

			if (!user) {
				user = await prisma.user.create({
					data: {
						email,
					},
					include: {
						image: { select: { id: true } },
					},
				})
				if (!user) throw new Error(ERRORS.AUTH_USER_NOT_CREATED)
			}

			const headers = await saveSession(request, { id: user.id })
			throw redirect(FEED_PATH, { headers })
		},
	),
)

export const getSession = async (request: Request) => {
	return await authSessionStorage.getSession(request.headers.get('Cookie'))
}

export const getSessionUser = async (
	request: Request,
): Promise<SessionUser | undefined> => {
	const session = await getSession(request)
	return session?.get(AUTH_SESSION_KEY)
}

export const saveSession = async (request: Request, user: SessionUser) => {
	const session = await getSession(request)
	session.set(AUTH_SESSION_KEY, user)
	return new Headers({
		'Set-Cookie': await authSessionStorage.commitSession(session),
	})
}

export const destroySession = async (request: Request) => {
	const session = await getSession(request)
	return new Headers({
		'Set-Cookie': await authSessionStorage.destroySession(session),
	})
}

export async function requireUser(
	request: Request,
	{ redirectTo }: { redirectTo?: string | null } = {},
) {
	const sessionUser = await getSessionUser(request)
	const user = sessionUser?.id
		? await prisma.user.findUnique({
				where: { id: sessionUser?.id },
				include: {
					image: { select: { id: true } },
				},
			})
		: null
	if (!user) {
		if (!redirectTo) throw redirect(LOGOUT_PATH)
		else throw redirect(redirectTo)
	}
	if (!user.username) throw redirect(SET_USERNAME_PATH)
	return user
}

export async function requireSessionUser(
	request: Request,
	{ redirectTo }: { redirectTo?: string | null } = {},
) {
	const sessionUser = await getSessionUser(request)
	if (!sessionUser) {
		if (!redirectTo) throw redirect(LOGOUT_PATH)
		else throw redirect(redirectTo)
	}
	return sessionUser
}
