import { type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Outlet, useLoaderData } from '@remix-run/react'

import { Header } from '~/components/header'
import { Navigation } from '~/components/navigation'
import { requireUser } from '~/modules/auth/auth.server'
import { siteConfig } from '~/utils/constants/brand'

export const ROUTE_PATH = '/dashboard' as const

export const meta: MetaFunction = () => {
	return [{ title: `${siteConfig.siteTitle} | Dashboard` }]
}

export async function loader({ request }: LoaderFunctionArgs) {
	const user = await requireUser(request)
	return { user }
}

export default function Dashboard() {
	const { user } = useLoaderData<typeof loader>()

	return (
		<div className="flex min-h-[100vh] w-full flex-col bg-secondary dark:bg-black">
			<Navigation user={user} />
			<Header />
			<Outlet />
		</div>
	)
}
