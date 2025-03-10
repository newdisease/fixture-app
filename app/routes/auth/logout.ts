import { redirect } from 'react-router'

import { ROUTE_PATH as FEED_PATH } from '../feed'
import { type Route } from './+types/logout'
import { destroySession } from '~/modules/auth/auth.server'

export const ROUTE_PATH = '/logout' as const

export async function action({ request }: Route.ActionArgs) {
	const headers = await destroySession(request)
	return redirect(FEED_PATH, { headers })
}
