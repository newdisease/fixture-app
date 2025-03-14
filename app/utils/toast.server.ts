/**
 * Server-Side Toasts.
 * Implementation based on github.com/epicweb-dev/epic-stack
 */
import { redirect, createCookieSessionStorage } from 'react-router'

import { combineHeaders } from './misc.server'
import { ToastSchema, type ToastInput } from './toast'

export const TOAST_SESSION_KEY = '_toast'
export const TOAST_SESSION_FLASH_KEY = '_toast_flash'

export const toastSessionStorage = createCookieSessionStorage({
	cookie: {
		name: TOAST_SESSION_KEY,
		path: '/',
		sameSite: 'lax',
		httpOnly: true,
		secrets: [process.env.SESSION_SECRET || 'NOT_A_STRONG_SECRET'],
		secure: process.env.NODE_ENV === 'production',
	},
})

export async function getToastSession(request: Request) {
	const session = await toastSessionStorage.getSession(
		request.headers.get('Cookie'),
	)
	const result = ToastSchema.safeParse(session.get(TOAST_SESSION_FLASH_KEY))
	const toast = result.success ? result.data : null

	return {
		toast,
		headers: toast
			? new Headers({
					'Set-Cookie': await toastSessionStorage.commitSession(session),
				})
			: null,
	}
}

export async function createToastHeaders(toastInput: ToastInput) {
	const session = await toastSessionStorage.getSession()
	const toast = ToastSchema.parse(toastInput)
	session.flash(TOAST_SESSION_FLASH_KEY, toast)
	const cookie = await toastSessionStorage.commitSession(session)
	return new Headers({ 'Set-Cookie': cookie })
}

export async function redirectWithToast(
	url: string,
	toast: ToastInput,
	init?: ResponseInit,
) {
	return redirect(url, {
		...init,
		headers: combineHeaders(init?.headers, await createToastHeaders(toast)),
	})
}
