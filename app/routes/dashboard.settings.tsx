import { MetaFunction } from '@remix-run/node'
import { Link, Outlet, useLocation } from '@remix-run/react'

import { buttonVariants } from '~/components/ui/button'
import { siteConfig } from '~/utils/constants/brand'
import { cn } from '~/utils/misc'

export const ROUTE_PATH = '/dashboard/settings/' as const

export const meta: MetaFunction = () => {
  return [{ title: `${siteConfig.siteTitle} | Settings` }]
}

export default function Settings() {
  const location = useLocation()
  const isSettingsPath = location.pathname === ROUTE_PATH

  return (
    <div className="flex h-full w-full px-6 py-8">
      <div className="mx-auto flex h-full w-full max-w-screen-xl gap-12">
        <div className="hidden w-full max-w-64 flex-col gap-0.5 lg:flex">
          <Link
            to={ROUTE_PATH}
            prefetch="intent"
            className={cn(
              `${buttonVariants({ variant: 'ghost' })} ${isSettingsPath && 'bg-primary/5'} justify-start rounded-md`,
            )}>
            <span
              className={cn(
                `text-sm text-primary/80 ${isSettingsPath && 'font-medium text-primary'}`,
              )}>
              General
            </span>
          </Link>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
