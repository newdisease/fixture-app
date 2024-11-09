import { redirect, ActionFunctionArgs } from '@remix-run/node'

import { authenticator } from '~/modules/auth/auth.server'

import { MAIN_PATH } from './_index'

export const loader = () => redirect(MAIN_PATH)

export const action = ({ request }: ActionFunctionArgs) => {
  return authenticator.authenticate('google', request)
}
