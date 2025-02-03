import { type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import { Navigation } from '~/components/navigation'
import { authenticator } from '~/modules/auth/auth.server'
import { siteConfig } from '~/utils/constants/brand'
import { prisma } from '~/utils/db.server'

export const ROUTE_PATH = '/feed' as const

export const meta: MetaFunction = () => {
	return [{ title: `${siteConfig.siteTitle} | Feed` }]
}

export async function loader({ request }: LoaderFunctionArgs) {
	const sessionUser = await authenticator.isAuthenticated(request)
	let user = null
	if (sessionUser?.id)
		user = await prisma.user.findUnique({
			where: { id: sessionUser?.id },
			include: {
				image: { select: { id: true } },
			},
		})
	const promises = await prisma.promise.findMany({ take: 10 })
	return { user, promises }
}

export default function FeedPage() {
	const { user, promises } = useLoaderData<typeof loader>()
	return (
		<div className="flex min-h-[100vh] w-full flex-col bg-secondary dark:bg-black">
			<Navigation
				user={user ? user : undefined}
				isAuth={!!user}
				simple={!user}
			/>
			<div>
				{promises.map((promise) => (
					<div key={promise.id} className="mt-4 border border-gray-200 p-4">
						<h2 className="text-xl font-bold">{promise.title}</h2>
						<p className="text-gray-700">{promise.description}</p>
						<p className="text-gray-500">{promise.deadline.toString()}</p>
					</div>
				))}
			</div>
		</div>
	)
}
