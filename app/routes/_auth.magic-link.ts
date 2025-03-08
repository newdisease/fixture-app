import { type LoaderFunctionArgs } from 'react-router'

import { authenticator } from '~/modules/auth/auth.server'

export const ROUTE_PATH = '/magic-link' as const

export async function loader({ request }: LoaderFunctionArgs) {
	return authenticator.authenticate('TOTP', request)
}
