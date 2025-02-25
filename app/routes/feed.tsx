import { type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import Footer from '~/components/footer'

import { Navigation } from '~/components/navigation'
import { TaskCard } from '~/components/task-card'
import { PageContainer } from '~/components/ui/page-container'
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

	const tasks = await prisma.task.findMany({
		take: 10,
		include: {
			subscriptions: {
				where: {
					userId: sessionUser?.id,
				},
			},
			creator: {
				select: {
					fullName: true,
				},
			},
		},
	})

	return { user, tasks }
}

export default function FeedPage() {
	const { user, tasks } = useLoaderData<typeof loader>()
	return (
		<PageContainer>
			<Navigation user={user ?? undefined} isAuth={!!user} simple={!user} />
			<div className="mx-auto grid w-full max-w-(--breakpoint-xl) grid-cols-1 gap-6 p-4 sm:grid-cols-2 lg:grid-cols-3">
				{tasks.map((task) => (
					<TaskCard key={task.id} task={task} onComplete={() => {}} />
				))}
			</div>
			<Footer />
		</PageContainer>
	)
}
