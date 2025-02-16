import { type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { Outlet, useLoaderData } from '@remix-run/react'

import { ROUTE_PATH as DASHBOARD_PATH } from './dashboard'
import { ROUTE_PATH as NEW_TASK_PATH } from './dashboard.add-new'
import { ROUTE_PATH as SETTINGS_PATH } from './dashboard.settings'
import Footer from '~/components/footer'
import { Header } from '~/components/header'
import { Navigation } from '~/components/navigation'
import SubNavigation from '~/components/sub-navigation'
import PageContainer from '~/components/ui/page-container'
import { requireUser } from '~/modules/auth/auth.server'
import { siteConfig } from '~/utils/constants/brand'

export const ROUTE_PATH = '/dashboard' as const

const dashboardItems = [
	{
		path: DASHBOARD_PATH,
		label: 'Dashboard',
		description: 'Your activity.',
	},
	{
		path: NEW_TASK_PATH,
		label: 'New Promise',
		description:
			'Create a new promise with a title, description, and deadline.',
	},
	{
		path: SETTINGS_PATH,
		label: 'Settings',
		description: 'Manage your account settings.',
	},
]

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
		<PageContainer footer={<Footer />}>
			<Navigation user={user}>
				<SubNavigation navItems={dashboardItems} />
			</Navigation>
			<Header headerItems={dashboardItems} />
			<Outlet />
		</PageContainer>
	)
}
