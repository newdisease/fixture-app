import { redirect, ActionFunctionArgs } from '@remix-run/node'

import { authenticator } from '~/modules/auth/auth.server'

export const AUTH_GOOGLE_PATH = '/auth/google' as const

export const loader = () => redirect('/')

export const action = ({ request }: ActionFunctionArgs) => {
  return authenticator.authenticate('google', request)
}
