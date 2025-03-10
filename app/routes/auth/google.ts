import { redirect } from 'react-router'

import { type Route } from './+types/google'
import { authenticator } from '~/modules/auth/auth.server'

export const ROUTE_PATH = '/google' as const

export const loader = () => redirect('/')

export const action = ({ request }: Route.LoaderArgs) => {
	return authenticator.authenticate('google', request)
}
