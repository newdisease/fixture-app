import { type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'

import { ROUTE_PATH as FEED_PATH } from './feed'
import { ThemeSwitcherHome } from '~/components/misc/theme-switcher'
import { Navigation } from '~/components/navigation'
import { Button } from '~/components/ui/button'
import { authenticator } from '~/modules/auth/auth.server'
import { siteConfig } from '~/utils/constants/brand'

export const ROUTE_PATH = '/' as const

export const meta: MetaFunction = () => {
	return [
		{ title: `${siteConfig.siteTitle}` },
		{ name: 'description', content: 'Welcome to the Fixture App.' },
	]
}

export async function loader({ request }: LoaderFunctionArgs) {
	const sessionUser = await authenticator.isAuthenticated(request)
	return { user: sessionUser }
}

export default function Index() {
	const { user } = useLoaderData<typeof loader>()

	return (
		<div className="relative flex h-lvh w-full flex-col justify-between bg-card">
			<Navigation simple isAuth={!!user} />
			<div className="z-10 mx-auto flex w-full max-w-screen-lg flex-col items-center justify-center gap-8 py-16">
				<h1 className="text-center text-6xl font-extrabold leading-tight text-primary md:text-4xl lg:leading-tight">
					Welcome to the
					<br />
					<span className="bg-gradient-to-r from-[#33d098] to-purple-400 bg-clip-text text-transparent dark:from-[#33d098] dark:to-purple-400 md:text-6xl">
						Fixture App
					</span>
				</h1>

				<Link to={FEED_PATH} tabIndex={-1} className="text-center outline-none">
					<Button
						variant="default"
						className="group h-12 w-48 transform bg-gradient-to-r from-green-400 to-blue-500 text-lg font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105 hover:from-green-500 hover:to-blue-600 dark:from-green-400 dark:to-blue-500 dark:hover:from-green-500 dark:hover:to-blue-600"
					>
						Show feed
					</Button>
				</Link>
			</div>
			<footer className="z-10 flex w-full flex-col items-center justify-center gap-8 py-6">
				<ThemeSwitcherHome />
				<p className="flex items-center whitespace-nowrap text-center text-sm font-medium text-primary/60">
					&copy; {new Date().getFullYear()} Fixture App. All rights reserved.
				</p>
			</footer>
		</div>
	)
}
