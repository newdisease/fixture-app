import { Link, useLocation } from '@remix-run/react'
import { buttonVariants } from './ui/button'
import { cn } from '~/utils/misc'

export interface NavItem {
	path: string
	label: string
}

export default function SubNavigation({ navItems }: { navItems: NavItem[] }) {
	const location = useLocation()

	return (
		<div className="mx-auto flex w-full max-w-screen-xl items-center gap-3">
			{navItems.map(({ path, label }) => {
				const isActive = location.pathname === path

				return (
					<div
						key={path}
						className={cn('flex h-12 items-center border-b-2', {
							'border-primary': isActive,
							'border-transparent': !isActive,
						})}
					>
						<Link
							to={path}
							prefetch="intent"
							className={cn(
								buttonVariants({ variant: 'ghost', size: 'sm' }),
								'text-primary/80',
							)}
						>
							{label}
						</Link>
					</div>
				)
			})}
		</div>
	)
}
