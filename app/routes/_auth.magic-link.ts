import { type LoaderFunctionArgs } from '@remix-run/node'

import { ROUTE_PATH as LOGIN_PATH } from './_auth.login'
import { authenticator } from '~/modules/auth/auth.server'
import { ROUTE_PATH as FEED_PATH } from '~/routes/_app.feed'

export const ROUTE_PATH = '/magic-link' as const

export async function loader({ request }: LoaderFunctionArgs) {
	return authenticator.authenticate('TOTP', request, {
		successRedirect: FEED_PATH,
		failureRedirect: LOGIN_PATH,
	})
}
