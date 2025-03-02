import { type ActionFunctionArgs } from 'react-router'

import { requireUser } from '~/modules/auth/auth.server'
import { prisma } from '~/utils/db.server'

export const ROUTE_PATH = '/resources/reset-image' as const

export async function action({ request }: ActionFunctionArgs) {
	const user = await requireUser(request)
	await prisma.userImage.deleteMany({ where: { userId: user.id } })
	return null
}
