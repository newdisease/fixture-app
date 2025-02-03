import { type User } from '@prisma/client'
import { Link, useLocation } from '@remix-run/react'
import { MainLogo } from './main-logo'
import SubNavigation from './sub-navigation'
import { buttonVariants } from './ui/button'
import UserMenu from './user-menu'
import { ROUTE_PATH as HOME_PATH } from '~/routes/_index'
import { ROUTE_PATH as DASHBOARD_PATH } from '~/routes/dashboard'
import { ROUTE_PATH as SETTINGS_PATH } from '~/routes/dashboard.settings'
import { ROUTE_PATH as LOGIN_PATH } from '~/routes/login'
import { cn } from '~/utils/misc'

type NavigationProps = {
	user?: User & { image: { id: string } | null }
	simple?: boolean
	isAuth?: boolean
}

export function Navigation({ user, simple, isAuth }: NavigationProps) {
	const location = useLocation()
	const isDashboardPath = location.pathname === DASHBOARD_PATH
	const isSettingsPath = location.pathname === SETTINGS_PATH

	return (
		<nav className="sticky top-0 z-50 flex w-full flex-col border-b border-border bg-card px-6">
			<div className="mx-auto flex w-full max-w-screen-xl items-center justify-between py-3">
				<Link
					to={simple ? HOME_PATH : DASHBOARD_PATH}
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
			{!simple && user && location.pathname.includes(DASHBOARD_PATH) && (
				<SubNavigation
					isDashboardPath={isDashboardPath}
					isSettingsPath={isSettingsPath}
				/>
			)}
		</nav>
	)
}
