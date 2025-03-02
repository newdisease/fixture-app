import { redirect, type ActionFunctionArgs } from 'react-router'

import { authenticator } from '~/modules/auth/auth.server'

export const ROUTE_PATH = '/google' as const

export const loader = () => redirect('/')

export const action = ({ request }: ActionFunctionArgs) => {
	return authenticator.authenticate('google', request)
}
