import { redirect } from 'react-router'

import { type Route } from './+types/google-callback'
import { authenticator, saveSession } from '~/modules/auth/auth.server'
import { ROUTE_PATH as FEED_PATH } from '~/routes/feed'

export const ROUTE_PATH = '/google-callback' as const

export const loader = async ({ request }: Route.LoaderArgs) => {
	const sessionUser = await authenticator.authenticate('google', request)
	const headers = await saveSession(request, sessionUser)
	return redirect(FEED_PATH, { headers })
}
