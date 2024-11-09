import { LoaderFunctionArgs } from '@remix-run/node'

import { authenticator } from '~/modules/auth/auth.server'

import { MAIN_PATH } from './_index'

export const loader = ({ request }: LoaderFunctionArgs) => {
  return authenticator.authenticate('google', request, {
    successRedirect: MAIN_PATH,
    failureRedirect: MAIN_PATH,
  })
}
