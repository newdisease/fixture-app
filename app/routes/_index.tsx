import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { Form, Link, useLoaderData } from '@remix-run/react'

import { ThemeSwitcherHome } from '~/components/misc/theme-switcher'
import { Button, buttonVariants } from '~/components/ui/button'
import { authenticator } from '~/modules/auth/auth.server'
import { cn } from '~/utils/misc'

import { ROUTE_PATH as AUTH_GOOGLE_PATH } from './auth.google'
import { ROUTE_PATH as DASHBOARD_PATH } from './dashboard'

export const ROUTE_PATH = '/' as const

export const meta: MetaFunction = () => {
  return [{ title: 'Fixture' }, { name: 'description', content: 'Fixture app!' }]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const sessionUser = await authenticator.isAuthenticated(request)
  return { user: sessionUser }
}

export default function Index() {
  const { user } = useLoaderData<typeof loader>()

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-16">
        <header className="flex flex-col items-center gap-9">
          <h1 className="leading text-2xl font-bold text-gray-800 dark:text-gray-100">
            Welcome to Fixture App!
          </h1>
        </header>
        {user ? (
          <Link to={DASHBOARD_PATH} className={cn(buttonVariants({ size: 'sm' }), 'h-8')}>
            Dashboard
          </Link>
        ) : (
          <Form action={AUTH_GOOGLE_PATH} method="post">
            <Button className={cn(buttonVariants({ size: 'sm' }), 'h-8')}>
              Login with Google
            </Button>
          </Form>
        )}
        <ThemeSwitcherHome />
      </div>
    </div>
  )
}
