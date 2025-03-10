import { Outlet, useRouteLoaderData } from 'react-router'

import { type Route } from './+types/app-layout'
import Footer from '~/components/footer'
import { Header } from '~/components/header'

import { getSessionUser } from '~/modules/auth/auth.server'
import { prisma } from '~/utils/db.server'

export async function loader({ request }: Route.LoaderArgs) {
	const sessionUser = await getSessionUser(request)
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

export default function AppLayout({ loaderData }: Route.ComponentProps) {
	const { user } = loaderData
	return (
		<>
			<Header user={user} />
			<main className="flex-grow">
				<Outlet />
			</main>
			<Footer />
		</>
	)
}

export const useUserLoaderData = () => {
	const data = useRouteLoaderData<Route.ComponentProps['loaderData']>(
		'routes/layouts/app-layout',
	)
	if (!data)
		throw new Error(
			'useRouteLoaderData must be used inside a route that is the child of "app-layout"',
		)
	return data
}
