import type { User } from '@prisma/client'
import { Link, useLocation, useSubmit, useNavigate } from '@remix-run/react'
import { Settings, LogOut } from 'lucide-react'

import { ROUTE_PATH as LOGOUT_PATH } from '~/routes/auth.logout'
import { ROUTE_PATH as DASHBOARD_PATH } from '~/routes/dashboard'
import { ROUTE_PATH as SETTINGS_PATH } from '~/routes/dashboard.settings'
import { useRequestInfo } from '~/utils/hooks/use-request-info'
import { cn } from '~/utils/misc'

import { Logo } from './logo'
import { ThemeSwitcher } from './misc/theme-switcher'
import { UserAvatar } from './misc/user-avatar'
import { Button, buttonVariants } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

type NavigationProps = {
  user: User & { image: { id: string } | null }
}

export function Navigation({ user }: NavigationProps) {
  const navigate = useNavigate()
  const submit = useSubmit()
  const requestInfo = useRequestInfo()

  const location = useLocation()
  const isDashboardPath = location.pathname === DASHBOARD_PATH
  const isSettingsPath = location.pathname === SETTINGS_PATH

  return (
    <nav className="sticky top-0 z-50 flex w-full flex-col border-b border-border bg-card px-6">
      <div className="mx-auto flex w-full max-w-screen-xl items-center justify-between py-3">
        <Link
          to={DASHBOARD_PATH}
          prefetch="intent"
          className="flex h-10 items-center gap-1">
          <Logo />
        </Link>

        <div className="flex h-10 items-center gap-3">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 rounded-full">
                <UserAvatar user={user} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              sideOffset={8}
              className="fixed -right-4 min-w-56 bg-card p-2">
              <DropdownMenuItem className="group flex-col items-start focus:bg-transparent">
                <p className="text-sm font-medium text-primary/80 group-hover:text-primary group-focus:text-primary">
                  {user?.fullName || ''}
                </p>
                <p className="text-sm text-primary/60">{user?.email}</p>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="group h-9 w-full cursor-pointer justify-between rounded-md px-2"
                onClick={() => navigate(SETTINGS_PATH)}>
                <span className="text-sm text-primary/60 group-hover:text-primary group-focus:text-primary">
                  Settings
                </span>
                <Settings className="h-[18px] w-[18px] stroke-[1.5px] text-primary/60 group-hover:text-primary group-focus:text-primary" />
              </DropdownMenuItem>

              <DropdownMenuItem
                onSelect={(event) => event.preventDefault()}
                className={cn(
                  'group flex h-9 justify-between rounded-md px-2 hover:bg-transparent',
                )}>
                <span className="w-full text-sm text-primary/60 group-hover:text-primary group-focus:text-primary">
                  Theme
                </span>
                <ThemeSwitcher userPreference={requestInfo.userPrefs.theme} />
              </DropdownMenuItem>

              <DropdownMenuSeparator className="mx-0 my-2" />

              <DropdownMenuItem
                className="group h-9 w-full cursor-pointer justify-between rounded-md px-2"
                onClick={() => submit({}, { action: LOGOUT_PATH, method: 'POST' })}>
                <span className="text-sm text-primary/60 group-hover:text-primary group-focus:text-primary">
                  Log Out
                </span>
                <LogOut className="h-[18px] w-[18px] stroke-[1.5px] text-primary/60 group-hover:text-primary group-focus:text-primary" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-screen-xl items-center gap-3">
        <div
          className={`flex h-12 items-center border-b-2 ${isDashboardPath ? 'border-primary' : 'border-transparent'}`}>
          <Link
            to={DASHBOARD_PATH}
            prefetch="intent"
            className={cn(
              `${buttonVariants({ variant: 'ghost', size: 'sm' })} text-primary/80`,
            )}>
            Dashboard
          </Link>
        </div>
        <div
          className={`flex h-12 items-center border-b-2 ${isSettingsPath ? 'border-primary' : 'border-transparent'}`}>
          <Link
            to={SETTINGS_PATH}
            prefetch="intent"
            className={cn(
              `${buttonVariants({ variant: 'ghost', size: 'sm' })} text-primary/80`,
            )}>
            Settings
          </Link>
        </div>
      </div>
    </nav>
  )
}
