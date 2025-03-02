import { type LoaderFunctionArgs } from 'react-router'

import { authenticator } from '~/modules/auth/auth.server'
import { ROUTE_PATH as FEED_PATH } from '~/routes/_app.feed'

export const ROUTE_PATH = '/google/callback' as const

export const loader = ({ request }: LoaderFunctionArgs) => {
	return authenticator.authenticate('google', request, {
		successRedirect: FEED_PATH,
		failureRedirect: '/',
	})
}
