import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import {
	type ActionFunctionArgs,
	data,
	type LoaderFunctionArgs,
	redirect,
} from '@remix-run/node'

import { Form, useLoaderData, type MetaFunction } from '@remix-run/react'

import { Loader2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { AuthenticityTokenInput } from 'remix-utils/csrf/react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { useHydrated } from 'remix-utils/use-hydrated'
import { z } from 'zod'
import { ROUTE_PATH as AUTH_VERIFY_PATH } from './_auth.verify-code.tsx'
import { ROUTE_PATH as DASHBOARD_PATH } from './dashboard'
import { MainLogo } from '~/components/misc/main-logo'
import { ThemeSwitcherHome } from '~/components/misc/theme-switcher'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { commitSession, getSession } from '~/modules/auth/auth-session.server'
import { authenticator } from '~/modules/auth/auth.server'
import { ROUTE_PATH as AUTH_GOOGLE_PATH } from '~/routes/_auth.google'
import { siteConfig } from '~/utils/constants/brand'
import { validateCSRF } from '~/utils/csrf.server'
import { checkHoneypot } from '~/utils/honeypot.server'
import { useIsPending } from '~/utils/hooks/use-is-pending'

export const ROUTE_PATH = '/login' as const

export const LoginSchema = z.object({
	email: z.string().max(256).email('Email address is not valid.'),
})

export const meta: MetaFunction = () => {
	return [{ title: `${siteConfig.siteTitle} | Login` }]
}

export async function action({ request }: ActionFunctionArgs) {
	const url = new URL(request.url)
	const pathname = url.pathname

	const clonedRequest = request.clone()
	const formData = await clonedRequest.formData()
	await validateCSRF(formData, clonedRequest.headers)
	checkHoneypot(formData)

	await authenticator.authenticate('TOTP', request, {
		successRedirect: AUTH_VERIFY_PATH,
		failureRedirect: pathname,
	})
}

export async function loader({ request }: LoaderFunctionArgs) {
	const sessionUser = await authenticator.isAuthenticated(request)

	if (sessionUser) {
		throw redirect(DASHBOARD_PATH)
	}

	const cookie = await getSession(request.headers.get('Cookie'))
	const authEmail = cookie.get('auth:email')
	const authError = cookie.get(authenticator.sessionErrorKey)
	return data(
		{ authEmail, authError },
		{ headers: { 'Set-Cookie': await commitSession(cookie) } },
	)
}

export default function LoginPage() {
	const { authEmail, authError } = useLoaderData<typeof loader>()
	const inputRef = useRef<HTMLInputElement>(null)
	const isHydrated = useHydrated()
	const isPending = useIsPending()

	const [emailForm, { email }] = useForm({
		constraint: getZodConstraint(LoginSchema),
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: LoginSchema })
		},
	})

	useEffect(() => {
		isHydrated && inputRef.current?.focus()
	}, [isHydrated])

	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
			<div className="w-full max-w-sm">
				<div className="flex flex-col gap-6">
					<a href="/" className="flex flex-col items-center font-medium">
						<MainLogo />
					</a>
					<Form
						method="POST"
						autoComplete="off"
						className="flex flex-col gap-6"
						{...getFormProps(emailForm)}
					>
						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input
								placeholder="m@example.com"
								ref={inputRef}
								defaultValue={authEmail ? authEmail : ''}
								required
								{...getInputProps(email, { type: 'email' })}
							/>
							{!authError && email.errors && (
								<span className="mb-2 text-sm text-destructive dark:text-destructive-foreground">
									{email.errors.join(' ')}
								</span>
							)}
							{!authEmail && authError && (
								<span className="mb-2 text-sm text-destructive dark:text-destructive-foreground">
									{authError.message}
								</span>
							)}
						</div>
						<Button type="submit" className="w-full" disabled={isPending}>
							{isPending ? (
								<Loader2 className="animate-spin" />
							) : (
								'Continue with Email'
							)}
						</Button>
						{/* Security */}
						<AuthenticityTokenInput />
						<HoneypotInputs />
					</Form>
					<div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
						<span className="relative z-10 bg-background px-2 text-muted-foreground">
							Or
						</span>
					</div>
					<Form action={AUTH_GOOGLE_PATH} method="post">
						<Button variant="outline" className="w-full">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
								<path
									d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
									fill="currentColor"
								/>
							</svg>
							Continue with Google
						</Button>
					</Form>
					<div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
						By clicking continue, you agree to our{' '}
						<a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
					</div>
					<ThemeSwitcherHome className="m-auto" />
				</div>
			</div>
		</div>
	)
}
