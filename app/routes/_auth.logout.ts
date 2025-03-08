import { type ActionFunctionArgs, redirect } from 'react-router'

import { ROUTE_PATH as FEED_PATH } from './_app.feed'
import { destroySession } from '~/modules/auth/auth.server'

export const ROUTE_PATH = '/logout' as const

export async function action({ request }: ActionFunctionArgs) {
	const headers = await destroySession(request)
	return redirect(FEED_PATH, { headers })
}
