import { type Route } from './+types/reset-image'
import { requireUser } from '~/modules/auth/auth.server'
import { prisma } from '~/utils/db.server'

export const ROUTE_PATH = '/resources/reset-image' as const

export async function action({ request }: Route.ActionArgs) {
	const user = await requireUser(request)
	await prisma.userImage.deleteMany({ where: { userId: user.id } })
	return null
}
