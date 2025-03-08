import { redirect, type LoaderFunctionArgs } from 'react-router'

import { authenticator, saveSession } from '~/modules/auth/auth.server'
import { ROUTE_PATH as FEED_PATH } from '~/routes/_app.feed'

export const ROUTE_PATH = '/google/callback' as const

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const sessionUser = await authenticator.authenticate('google', request)
	const headers = await saveSession(request, sessionUser)
	return redirect(FEED_PATH, { headers })
}
