import { type Route } from './+types/magic-link'
import { authenticator } from '~/modules/auth/auth.server'

export const ROUTE_PATH = '/magic-link' as const

export async function loader({ request }: Route.LoaderArgs) {
	return authenticator.authenticate('TOTP', request)
}
