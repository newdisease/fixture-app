import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { Cookie } from '@mjackson/headers'
import { Loader2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { redirect, Form, type MetaFunction, Link } from 'react-router'

import { AuthenticityTokenInput } from 'remix-utils/csrf/react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { useHydrated } from 'remix-utils/use-hydrated'
import { z } from 'zod'
import { type Route } from './+types/login'
import { MainLogo } from '~/components/misc/main-logo'
import { ThemeSwitcherHome } from '~/components/misc/theme-switcher'
import { Button } from '~/components/ui/button'
import { ErrorMessage } from '~/components/ui/error-message'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
	authenticator,
	getSessionUser,
	TOTP_COOKIE_KEY,
} from '~/modules/auth/auth.server'
import { ROUTE_PATH as AUTH_GOOGLE_PATH } from '~/routes/auth/google'
import { ROUTE_PATH as FEED_PATH } from '~/routes/feed'
import { siteConfig } from '~/utils/constants/brand'
import { validateCSRF } from '~/utils/csrf.server'
import { checkHoneypot } from '~/utils/honeypot.server'
import { useIsPending } from '~/utils/hooks/use-is-pending'

export const ROUTE_PATH = '/login' as const

export const LoginSchema = z.object({
	email: z.string().max(256).email('Email address is not valid.'),
})

export const meta: MetaFunction = () => {
	return [{ title: `Login | ${siteConfig.siteTitle}` }]
}

export async function loader({ request }: Route.LoaderArgs) {
	const sessionUser = await getSessionUser(request)
	if (sessionUser) {
		throw redirect(FEED_PATH)
	}

	const cookie = new Cookie(request.headers.get('cookie') || '')
	const totpCookie = cookie.get(TOTP_COOKIE_KEY)

	if (totpCookie) {
		const params = new URLSearchParams(totpCookie)
		if (params.has('error')) return { error: params.get('error') }
	}
}

export async function action({ request }: Route.ActionArgs) {
	const clonedRequest = request.clone()
	const formData = await clonedRequest.formData()
	await validateCSRF(formData, clonedRequest.headers)
	await checkHoneypot(formData)

	// Authenticate the user via TOTP (Form submission).
	await authenticator.authenticate('TOTP', request)
}

export default function LoginPage({ loaderData }: Route.ComponentProps) {
	const serverError =
		loaderData && 'error' in loaderData ? loaderData.error : undefined

	const inputRef = useRef<HTMLInputElement>(null)
	const isHydrated = useHydrated()
	const isPending = useIsPending()

	const [emailForm, { email }] = useForm({
		constraint: getZodConstraint(LoginSchema),
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: LoginSchema })
		},
	})

	const emailInputProps = getInputProps(email, { type: 'email' })

	useEffect(() => {
		isHydrated && inputRef.current?.focus()
	}, [isHydrated])

	return (
		<div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
			<div className="w-full max-w-sm">
				<div className="flex flex-col gap-6">
					<Link to="/" className="flex flex-col items-center font-medium">
						<MainLogo />
					</Link>
					<Form
						method="POST"
						autoComplete="off"
						className="flex flex-col gap-6"
						{...getFormProps(emailForm)}
					>
						<div className="grid gap-2">
							<Label htmlFor={emailInputProps.id}>Email</Label>
							<Input
								placeholder="m@example.com"
								ref={inputRef}
								required
								{...emailInputProps}
							/>
							{(serverError || email?.errors) && (
								<ErrorMessage>{serverError || email.errors?.[0]}</ErrorMessage>
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
					<div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
						<span className="bg-background text-muted-foreground relative z-10 px-2">
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
					<div className="text-muted-foreground [&_a]:hover:text-primary text-center text-xs text-balance [&_a]:underline [&_a]:underline-offset-4">
						By clicking continue, you agree to our{' '}
						<a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
					</div>
					<ThemeSwitcherHome className="m-auto" />
				</div>
			</div>
		</div>
	)
}
