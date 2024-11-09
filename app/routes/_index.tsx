import type { MetaFunction } from '@remix-run/node'
import { Form } from '@remix-run/react'

import { ThemeSwitcherHome } from '~/components/misc/theme-switcher'
import { Button } from '~/components/ui/button'

export const meta: MetaFunction = () => {
  return [{ title: 'Fixture' }, { name: 'description', content: 'Fixture app!' }]
}

export const MAIN_PATH = '/' as const

export default function Index() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-16">
        <header className="flex flex-col items-center gap-9">
          <h1 className="leading text-2xl font-bold text-gray-800 dark:text-gray-100">
            Unauthorized. Please login.
          </h1>
        </header>
        <Form action="/google" method="post">
          <Button>Login with Google</Button>
        </Form>
        <ThemeSwitcherHome />
      </div>
    </div>
  )
}
