import {
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
} from '@remix-run/node'

import { authenticator } from '~/modules/auth/auth.server'

export const ROUTE_PATH = '/logout' as const

export async function loader({ request }: LoaderFunctionArgs) {
	return authenticator.logout(request, { redirectTo: '/' })
}

export async function action({ request }: ActionFunctionArgs) {
	return authenticator.logout(request, { redirectTo: '/' })
}
