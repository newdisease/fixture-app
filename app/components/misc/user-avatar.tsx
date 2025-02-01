import { type User } from '@prisma/client'

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { getUserImgSrc } from '~/utils/misc'

type UserAvatarProps = {
	user: User & { image: { id: string } | null }
	className?: string
}

export function UserAvatar({ user, className }: UserAvatarProps) {
	const initials = user.fullName
		? user.fullName.split(' ').length > 1
			? `${user.fullName.split(' ')[0][0]}${user.fullName.split(' ')[1][0]}`
			: user.fullName[0]
		: user.email[0]

	return (
		<Avatar className={className}>
			<AvatarImage
				src={getUserImgSrc(user.image?.id)}
				alt={user.fullName ?? user.email}
			/>
			<AvatarFallback>{initials}</AvatarFallback>
		</Avatar>
	)
}
