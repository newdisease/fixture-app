import { type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import Footer from '~/components/footer'

import { Navigation } from '~/components/navigation'
import { PromiseCard } from '~/components/promise-card'
import PageContainer from '~/components/ui/page-container'
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

	if (sessionUser?.id) {
		user = await prisma.user.findUnique({
			where: { id: sessionUser.id },
			include: {
				image: { select: { id: true } },
			},
		})
	}

	const promises = await prisma.promise.findMany({
		take: 10,
		include: {
			subscriptions: {
				where: {
					userId: sessionUser?.id,
				},
			},
		},
	})

	const serializedPromises = promises.map((promise) => ({
		...promise,
		deadline: promise.deadline.toISOString(),
		createdAt: promise.createdAt.toISOString(),
		updatedAt: promise.updatedAt.toISOString(),
	}))

	return { user, promises: serializedPromises }
}

export default function FeedPage() {
	const { user, promises } = useLoaderData<typeof loader>()
	return (
		<PageContainer footer={<Footer />}>
			<Navigation user={user ?? undefined} isAuth={!!user} simple={!user} />
			<div className="mx-auto grid w-full max-w-screen-xl grid-cols-1 gap-6 p-4 sm:grid-cols-2 lg:grid-cols-3">
				{promises.map((promise) => (
					<PromiseCard
						key={promise.id}
						promise={promise}
						onComplete={() => {}}
					/>
				))}
			</div>
		</PageContainer>
	)
}
