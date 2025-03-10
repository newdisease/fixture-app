import { redirect } from 'react-router'
import { safeRedirect } from 'remix-utils/safe-redirect'

import { type Route } from './+types/update-theme'
import { ThemeSchema, setTheme } from '~/utils/hooks/use-theme'

export const ROUTE_PATH = '/resources/update-theme' as const

export async function action({ request }: Route.ActionArgs) {
	const formData = Object.fromEntries(await request.formData())
	const { theme, redirectTo } = ThemeSchema.parse(formData)

	const responseInit = {
		headers: { 'Set-Cookie': setTheme(theme) },
	}

	if (redirectTo) {
		return redirect(safeRedirect(redirectTo), responseInit)
	} else {
		return new Response(null, responseInit)
	}
}
