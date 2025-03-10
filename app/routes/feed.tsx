import { type MetaFunction } from 'react-router'

import { type Route } from './+types/feed'
import { TaskCard } from '~/components/task-card'
import { siteConfig } from '~/utils/constants/brand'
import { prisma } from '~/utils/db.server'

export const ROUTE_PATH = '/feed' as const
export const meta: MetaFunction = () => {
	return [{ title: `Feed | ${siteConfig.siteTitle}` }]
}

export async function loader() {
	const tasks = await prisma.task.findMany({
		take: 10,
		include: {
			subscriptions: {
				select: {
					userId: true,
				},
			},
			creator: {
				select: {
					fullName: true,
				},
			},
		},
	})
	return { tasks }
}

export default function FeedPage({ loaderData }: Route.ComponentProps) {
	const { tasks } = loaderData
	return (
		<div className="mx-auto grid w-full max-w-(--breakpoint-xl) grid-cols-1 gap-6 p-4 sm:grid-cols-2 lg:grid-cols-3">
			{tasks.map((task) => (
				<TaskCard key={task.id} task={task} onComplete={() => {}} />
			))}
		</div>
	)
}
