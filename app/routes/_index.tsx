import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'

import { ThemeSwitcherHome } from '~/components/misc/theme-switcher'
import { Button } from '~/components/ui/button'
import { authenticator } from '~/modules/auth/auth.server'

export const meta: MetaFunction = () => {
  return [{ title: 'Fixture' }, { name: 'description', content: 'Fixture app!' }]
}

export const MAIN_PATH = '/' as const

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
            {user ? `Hello, ${user.fullName}` : 'Unauthorized. Please login.'}
          </h1>
        </header>
        {user ? (
          <Form action="/logout" method="post">
            <Button>Logout</Button>
          </Form>
        ) : (
          <Form action="/google" method="post">
            <Button>Login with Google</Button>
          </Form>
        )}

        <ThemeSwitcherHome />
      </div>
    </div>
  )
}
