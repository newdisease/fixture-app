import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'

import { ThemeSwitcherHome } from '~/components/misc/theme-switcher'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import { authenticator } from '~/modules/auth/auth.server'
import { prisma } from '~/utils/db.server'
import { getUserImgSrc } from '~/utils/misc'

export const meta: MetaFunction = () => {
  return [{ title: 'Fixture' }, { name: 'description', content: 'Fixture app!' }]
}

export const MAIN_PATH = '/' as const

export async function loader({ request }: LoaderFunctionArgs) {
  const sessionUser = await authenticator.isAuthenticated(request)
  const user = sessionUser?.id
    ? await prisma.user.findUnique({
        where: { id: sessionUser?.id },
        include: {
          image: { select: { id: true } },
        },
      })
    : null
  return { user }
}

export default function Index() {
  const { user } = useLoaderData<typeof loader>()
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-16">
        <header className="flex flex-col items-center gap-9">
          <h1 className="leading text-2xl font-bold text-gray-800 dark:text-gray-100">
            {user ? (
              <div className="flex gap-3">
                {user.image?.id ? (
                  <Avatar>
                    <AvatarImage
                      src={getUserImgSrc(user.image.id)}
                      alt={`${user.fullName} avatar`}
                    />
                    <AvatarFallback>
                      {user.email.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : null}
                <h2 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                  Welcome, {user.fullName ?? user.email}!
                </h2>
              </div>
            ) : (
              'Unauthorized. Please login.'
            )}
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
