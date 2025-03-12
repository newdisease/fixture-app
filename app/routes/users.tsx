import { type MetaFunction } from 'react-router'

import { type Route } from './+types/users'
import { UserAvatar } from '~/components/misc/user-avatar'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { siteConfig } from '~/utils/constants/brand'
import { prisma } from '~/utils/db.server'

export const ROUTE_PATH = '/users' as const

export const meta: MetaFunction = () => {
	return [{ title: `Users | ${siteConfig.siteTitle}` }]
}

export async function loader() {
	const users = await prisma.user.findMany({
		take: 10,
		orderBy: { createdAt: 'desc' },
		include: {
			image: {
				select: {
					id: true,
				},
			},
		},
	})
	return { users }
}

function UserCard({
	user,
}: {
	user: Route.ComponentProps['loaderData']['users'][number]
}) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center gap-4">
				<UserAvatar user={user} />
				<CardTitle>{user.fullName || user.username || user.email}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-1">
					{user.username && <p>Username: @{user.username}</p>}
					<p>Email: {user.email}</p>
					<p className="text-muted-foreground text-sm">
						Joined: {new Date(user.createdAt).toLocaleDateString()}
					</p>
				</div>
			</CardContent>
		</Card>
	)
}

export default function UsersPage({ loaderData }: Route.ComponentProps) {
	const { users } = loaderData

	return (
		<div className="mx-auto grid w-full max-w-(--breakpoint-xl) grid-cols-1 gap-6 p-4 sm:grid-cols-2 lg:grid-cols-3">
			{users.map((user) => (
				<UserCard key={user.id} user={user} />
			))}
		</div>
	)
}
