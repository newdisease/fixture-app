import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node'

import { authenticator } from '~/modules/auth/auth.server'

import { MAIN_PATH } from './_index'

export const LOGOUT_PATH = '/logout' as const

export async function loader({ request }: LoaderFunctionArgs) {
  return authenticator.logout(request, { redirectTo: MAIN_PATH })
}

export async function action({ request }: ActionFunctionArgs) {
  return authenticator.logout(request, { redirectTo: MAIN_PATH })
}
