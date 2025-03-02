import { type LoaderFunctionArgs } from '@remix-run/node'
import { Outlet, useLoaderData } from '@remix-run/react'

import Footer from '~/components/footer'
import { Header } from '~/components/header'

import { authenticator } from '~/modules/auth/auth.server'
import { prisma } from '~/utils/db.server'

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

export default function Dashboard() {
	const { user } = useLoaderData<typeof loader>()
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
