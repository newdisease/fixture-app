import { type User } from '@prisma/client'
import { LogOut, Settings } from 'lucide-react'
import { useNavigate, useSubmit } from 'react-router'
import { ThemeSwitcher } from './misc/theme-switcher'
import { UserAvatar } from './misc/user-avatar'
import { Button } from './ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { ROUTE_PATH as SETTINGS_PATH } from '~/routes/_app.settings'
import { ROUTE_PATH as LOGOUT_PATH } from '~/routes/_auth.logout'
import { useRequestInfo } from '~/utils/hooks/use-request-info'
import { cn } from '~/utils/misc'

type UserMenuProps = {
	user: User & { image: { id: string } | null }
	className?: string
}
const UserMenu = ({ user, className }: UserMenuProps) => {
	const navigate = useNavigate()
	const submit = useSubmit()
	const requestInfo = useRequestInfo()

	return (
		<div className={cn('flex h-10 items-center gap-3', className)}>
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						className="h-8 w-8 cursor-pointer rounded-full"
					>
						<UserAvatar user={user} className="h-8 w-8" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					sideOffset={8}
					className="bg-card fixed -right-4 min-w-56 p-2"
				>
					<DropdownMenuItem className="group flex-col items-start focus:bg-transparent">
						<p className="text-primary/80 group-hover:text-primary group-focus:text-primary text-sm font-medium">
							{user.fullName}
						</p>
						<p className="text-primary/60 text-sm">@{user.username}</p>
					</DropdownMenuItem>
					<DropdownMenuItem
						className="group h-9 w-full cursor-pointer justify-between rounded-md px-2"
						onClick={() => navigate(SETTINGS_PATH)}
					>
						<span className="text-primary/60 group-hover:text-primary group-focus:text-primary text-sm">
							Settings
						</span>
						<Settings className="text-primary/60 group-hover:text-primary group-focus:text-primary h-[18px] w-[18px] stroke-[1.5px]" />
					</DropdownMenuItem>
					<DropdownMenuItem
						onSelect={(event) => event.preventDefault()}
						className={cn(
							'group flex h-9 justify-between rounded-md px-2 hover:bg-transparent',
						)}
					>
						<span className="text-primary/60 group-hover:text-primary group-focus:text-primary w-full text-sm">
							Theme
						</span>
						<ThemeSwitcher userPreference={requestInfo.userPrefs.theme} />
					</DropdownMenuItem>
					<DropdownMenuSeparator className="mx-0 my-2" />
					<DropdownMenuItem
						className="group h-9 w-full cursor-pointer justify-between rounded-md px-2"
						onClick={() => submit({}, { action: LOGOUT_PATH, method: 'POST' })}
					>
						<span className="text-primary/60 group-hover:text-primary group-focus:text-primary text-sm">
							Log Out
						</span>
						<LogOut className="text-primary/60 group-hover:text-primary group-focus:text-primary h-[18px] w-[18px] stroke-[1.5px]" />
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	)
}

UserMenu.displayName = 'UserMenu'

export { UserMenu }
