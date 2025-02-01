import { type LoaderFunctionArgs, redirect } from '@remix-run/node'
import { Form } from '@remix-run/react'

import { ROUTE_PATH as AUTH_GOOGLE_PATH } from './auth.google'
import { ROUTE_PATH as DASHBOARD_PATH } from './dashboard'
import { ThemeSwitcherHome } from '~/components/misc/theme-switcher'
import { Button, buttonVariants } from '~/components/ui/button'
import { authenticator } from '~/modules/auth/auth.server'
import { cn } from '~/utils/misc'

export const ROUTE_PATH = '/login' as const
export async function loader({ request }: LoaderFunctionArgs) {
	const sessionUser = await authenticator.isAuthenticated(request)

	if (sessionUser) {
		throw redirect(DASHBOARD_PATH)
	}
	return null
}

export default function LoginPage() {
	return (
		<div className="flex h-screen items-center justify-center">
			<div className="flex flex-col items-center gap-16">
				<header className="flex flex-col items-center gap-9">
					<h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
						Login to Fixture App
					</h1>
				</header>
				<Form action={AUTH_GOOGLE_PATH} method="post">
					<Button className={cn(buttonVariants({ size: 'sm' }), 'h-8')}>
						Login with Google
					</Button>
				</Form>
				<ThemeSwitcherHome />
			</div>
		</div>
	)
}
