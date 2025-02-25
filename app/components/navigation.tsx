import { type User } from '@prisma/client'
import { Link } from '@remix-run/react'
import { type PropsWithChildren } from 'react'
import { MainLogo } from './misc/main-logo'
import { buttonVariants } from './ui/button'
import UserMenu from './user-menu'
import { ROUTE_PATH as LOGIN_PATH } from '~/routes/_auth.login'
import { ROUTE_PATH as HOME_PATH } from '~/routes/_index'
import { ROUTE_PATH as DASHBOARD_PATH } from '~/routes/dashboard'
import { cn } from '~/utils/misc'

type NavigationProps = PropsWithChildren<{
	user?: User & { image: { id: string } | null }
	simple?: boolean
	isAuth?: boolean
}>

export function Navigation({
	user,
	simple,
	isAuth,
	children,
}: NavigationProps) {
	return (
		<nav className="sticky top-0 z-50 flex w-full flex-col border-b border-border bg-card px-6">
			<div className="mx-auto flex w-full max-w-(--breakpoint-xl) items-center justify-between py-3">
				<Link
					to={HOME_PATH}
					prefetch="intent"
					className="flex h-10 items-center gap-1"
				>
					<MainLogo />
				</Link>
				{!simple && user && <UserMenu user={user} />}
				{simple && (
					<div className="flex h-10 items-center gap-3">
						<Link
							to={isAuth ? DASHBOARD_PATH : LOGIN_PATH}
							className={cn(buttonVariants({ size: 'sm' }), 'h-8')}
						>
							{isAuth ? 'Dashboard' : 'Get Started'}
						</Link>
					</div>
				)}
			</div>
			{children}
		</nav>
	)
}
