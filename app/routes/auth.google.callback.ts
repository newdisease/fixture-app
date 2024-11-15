import { LoaderFunctionArgs } from '@remix-run/node'

import { authenticator } from '~/modules/auth/auth.server'

export const loader = ({ request }: LoaderFunctionArgs) => {
  return authenticator.authenticate('google', request, {
    successRedirect: '/',
    failureRedirect: '/',
  })
}
