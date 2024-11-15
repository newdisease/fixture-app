import { MetaFunction } from '@remix-run/node'

import { siteConfig } from '~/utils/constants/brand'

export const DASHBOARD_SETTINGS_PATH = '/dashboard/settings'

export const meta: MetaFunction = () => {
  return [{ title: `${siteConfig.siteTitle} | Settings` }]
}

export default function DashboardSettings() {
  return <div></div>
}
