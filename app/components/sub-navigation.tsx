import { Link } from '@remix-run/react'
import { buttonVariants } from './ui/button'
import { ROUTE_PATH as DASHBOARD_PATH } from '~/routes/dashboard'
import { ROUTE_PATH as SETTINGS_PATH } from '~/routes/dashboard.settings'

import { cn } from '~/utils/misc'

type SubNavigationProps = {
	isDashboardPath: boolean
	isSettingsPath: boolean
}
export default function SubNavigation({
	isDashboardPath,
	isSettingsPath,
}: SubNavigationProps) {
	return (
		<div className="mx-auto flex w-full max-w-screen-xl items-center gap-3">
			<div
				className={cn('flex h-12 items-center border-b-2', {
					'border-primary': isDashboardPath,
					'border-transparent': !isDashboardPath,
				})}
			>
				<Link
					to={DASHBOARD_PATH}
					prefetch="intent"
					className={cn(
						buttonVariants({ variant: 'ghost', size: 'sm' }),
						'text-primary/80',
					)}
				>
					Dashboard
				</Link>
			</div>
			<div
				className={cn('flex h-12 items-center border-b-2', {
					'border-primary': isSettingsPath,
					'border-transparent': !isSettingsPath,
				})}
			>
				<Link
					to={SETTINGS_PATH}
					prefetch="intent"
					className={cn(
						buttonVariants({ variant: 'ghost', size: 'sm' }),
						'text-primary/80',
					)}
				>
					Settings
				</Link>
			</div>
		</div>
	)
}
