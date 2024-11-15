import type { User } from '@prisma/client'
import { redirect } from '@remix-run/node'
import { Authenticator } from 'remix-auth'
import { GoogleStrategy } from 'remix-auth-google'

import { authSessionStorage } from '~/modules/auth/auth-session.server'
import { LOGOUT_PATH } from '~/routes/auth.logout'
import { ERRORS } from '~/utils/constants/errors'
import { prisma } from '~/utils/db.server'
import { HOST_URL } from '~/utils/misc.server'

export const authenticator = new Authenticator<User>(authSessionStorage)

/**
 * Google - Strategy.
 */
authenticator.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'EXAMPLE_CLIENT',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'EXAMPLE_SECRET',
      callbackURL: `${HOST_URL}/auth/google/callback`,
    },
    async ({ profile }) => {
      const email = profile._json.email || profile.emails[0].value
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

      return user
    },
  ),
)

export async function requireUser(
  request: Request,
  { redirectTo }: { redirectTo?: string | null } = {},
) {
  const sessionUser = await authenticator.isAuthenticated(request)
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
  return user
}
