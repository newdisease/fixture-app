import { LogIn, Menu as MenuIcon } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router'
import { type Route } from '../routes/layouts/+types/app-layout'
import { MainLogo } from './misc/main-logo'
import { Button } from './ui/button'
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from './ui/sheet'
import { UserMenu } from './user-menu'

import { ROUTE_PATH as ADD_POST_PATH } from '~/routes/add-new'
import { ROUTE_PATH as FEED_PATH } from '~/routes/feed'
import { cn } from '~/utils/misc'

const NAV_LINKS = [
	{ path: FEED_PATH, label: 'Feed', authRequired: false },
	{ path: '/users', label: 'Users', authRequired: true },
]

type HeaderProps = {
	user: Route.ComponentProps['loaderData']['user']
}

function Header({ user }: HeaderProps) {
	const navigate = useNavigate()
	const addPostDisabled = !user // "Add Post" should be disabled for unauthorized users

	return (
		<header className="border-grid bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
			<div className="border-hsl(var(--border) / .7) mx-auto max-w-7xl border-dashed">
				<div className="flex h-14 items-center justify-between px-4">
					{/* Logo and Desktop Navigation */}
					<div className="flex items-center @max-xs:pr-1">
						<Link to={FEED_PATH}>
							<MainLogo />
						</Link>
						<nav className="ml-6 hidden items-center space-x-4 md:flex">
							{NAV_LINKS.map(({ path, label, authRequired }) => {
								const disabled = authRequired && !user
								return (
									<NavLink
										key={path}
										to={path}
										className={({ isActive }) =>
											cn(
												'rounded-xs border-b-2 px-3 py-2 text-sm transition-colors',
												isActive
													? 'border-primary text-primary'
													: 'text-foreground/80 hover:text-foreground/80 border-transparent',
												disabled && 'pointer-events-none opacity-50',
											)
										}
									>
										{label}
									</NavLink>
								)
							})}
							{/* Add Post Link/Button with distinct styling */}
							<Button
								variant="outline"
								size="sm"
								disabled={addPostDisabled}
								onClick={() => navigate(ADD_POST_PATH)}
							>
								Add Post
							</Button>
						</nav>
					</div>

					{/* Right-side Actions: Theme Toggle, User Menu/Login, Mobile Menu */}
					<div className="flex items-center space-x-2">
						{user ? (
							<UserMenu />
						) : (
							<Link to="/login">
								<Button variant="ghost" size="icon">
									<LogIn className="h-6 w-6" />
								</Button>
							</Link>
						)}
						<div className="md:hidden">
							<Sheet>
								<SheetTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										aria-label="Open mobile menu"
									>
										<MenuIcon className="h-6 w-6" />
									</Button>
								</SheetTrigger>
								<SheetContent side="left" className="p-4">
									<SheetHeader>
										<SheetTitle>Menu</SheetTitle>
									</SheetHeader>
									<div className="mt-4 space-y-4">
										{/* Mobile Navigation Links */}
										<nav className="flex flex-col space-y-2">
											{NAV_LINKS.map(({ path, label, authRequired }) => {
												const disabled = authRequired && !user
												return (
													<NavLink
														key={path}
														to={path}
														className={({ isActive }) =>
															cn(
																'px-3 py-2 text-sm',
																isActive
																	? 'text-primary'
																	: 'text-foreground/80 hover:text-foreground/80 border-transparent',
																disabled && 'pointer-events-none opacity-50',
															)
														}
													>
														{label}
													</NavLink>
												)
											})}
											{/* Add Post Link/Button with distinct styling */}
											<Button
												className="w-1/2"
												variant="outline"
												size="sm"
												disabled={addPostDisabled}
												onClick={() => navigate(ADD_POST_PATH)}
											>
												Add Post
											</Button>
										</nav>
									</div>
								</SheetContent>
							</Sheet>
						</div>
					</div>
				</div>
			</div>
		</header>
	)
}

Header.displayName = 'Header'

export { Header }
