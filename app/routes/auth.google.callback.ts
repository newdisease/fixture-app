import { type LoaderFunctionArgs } from '@remix-run/node'

import { authenticator } from '~/modules/auth/auth.server'
import { ROUTE_PATH as DASHBOARD_PATH } from '~/routes/dashboard'

export const loader = ({ request }: LoaderFunctionArgs) => {
	return authenticator.authenticate('google', request, {
		successRedirect: DASHBOARD_PATH,
		failureRedirect: '/',
	})
}
