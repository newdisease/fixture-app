import { useLocation } from '@remix-run/react'

import { ROUTE_PATH as DASHBOARD_PATH } from '~/routes/dashboard'
import { ROUTE_PATH as SETTINGS_PATH } from '~/routes/dashboard.settings'

export function Header() {
	const location = useLocation()
	const allowedLocations = [DASHBOARD_PATH, SETTINGS_PATH]

	const headerTitle = () => {
		if (location.pathname === DASHBOARD_PATH) return 'Dashboard'
		if (location.pathname === SETTINGS_PATH) return 'Settings'
	}
	const headerDescription = () => {
		if (location.pathname === DASHBOARD_PATH)
			return 'Manage your Apps and view your usage.'
		if (location.pathname === SETTINGS_PATH)
			return 'Manage your account settings.'
	}

	if (
		!allowedLocations.includes(
			location.pathname as (typeof allowedLocations)[number],
		)
	)
		return null

	return (
		<header className="z-10 flex w-full flex-col border-b border-border bg-card px-6">
			<div className="mx-auto flex w-full max-w-screen-xl items-center justify-between py-12">
				<div className="flex flex-col items-start gap-2">
					<h1 className="text-3xl font-medium text-primary/80">
						{headerTitle()}
					</h1>
					<p className="text-base font-normal text-primary/60">
						{headerDescription()}
					</p>
				</div>
			</div>
		</header>
	)
}
