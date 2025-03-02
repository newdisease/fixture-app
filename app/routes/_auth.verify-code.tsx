import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { useRef, useEffect } from 'react'
import {
	type MetaFunction,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
	redirect,
	Form,
	useLoaderData,
	data,
} from 'react-router'
import { AuthenticityTokenInput } from 'remix-utils/csrf/react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { useHydrated } from 'remix-utils/use-hydrated'
import { z } from 'zod'
import { ROUTE_PATH as FEED_PATH } from './_app.feed'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { commitSession, getSession } from '~/modules/auth/auth-session.server'
import { authenticator } from '~/modules/auth/auth.server'
import { siteConfig } from '~/utils/constants/brand'
import { validateCSRF } from '~/utils/csrf.server'
import { checkHoneypot } from '~/utils/honeypot.server'

export const ROUTE_PATH = '/verify-code' as const

export const VerifyLoginSchema = z.object({
	code: z.string().min(6, 'Code must be at least 6 characters.'),
})

export const meta: MetaFunction = () => {
	return [{ title: `${siteConfig.siteTitle} | Verify` }]
}

export async function loader({ request }: LoaderFunctionArgs) {
	await authenticator.isAuthenticated(request, {
		successRedirect: FEED_PATH,
	})

	const cookie = await getSession(request.headers.get('Cookie'))
	const authEmail = cookie.get('auth:email')
	const authError = cookie.get(authenticator.sessionErrorKey)

	if (!authEmail) return redirect('/auth/login')

	return data(
		{ authEmail, authError },
		{ headers: { 'Set-Cookie': await commitSession(cookie) } },
	)
}

export async function action({ request }: ActionFunctionArgs) {
	const url = new URL(request.url)
	const pathname = url.pathname

	const clonedRequest = request.clone()
	const formData = await clonedRequest.formData()
	await validateCSRF(formData, clonedRequest.headers)
	checkHoneypot(formData)

	await authenticator.authenticate('TOTP', request, {
		successRedirect: pathname,
		failureRedirect: pathname,
	})
}

export default function Verify() {
	const { authEmail, authError } = useLoaderData<typeof loader>()
	const inputRef = useRef<HTMLInputElement>(null)
	const isHydrated = useHydrated()

	const [codeForm, { code }] = useForm({
		constraint: getZodConstraint(VerifyLoginSchema),
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: VerifyLoginSchema })
		},
	})

	useEffect(() => {
		isHydrated && inputRef.current?.focus()
	}, [isHydrated])

	return (
		<div className="m-auto flex h-full w-full max-w-96 flex-col items-center justify-center gap-6">
			<div className="mb-2 flex flex-col gap-2">
				<p className="text-primary text-center text-2xl">Check your inbox!</p>
				<p className="text-primary/60 text-center text-base font-normal">
					We&apos;ve just emailed you a temporary password.
					<br />
					Please enter it below.
				</p>
			</div>
			<Form
				method="POST"
				autoComplete="off"
				className="flex w-full flex-col items-start gap-1"
				{...getFormProps(codeForm)}
			>
				<AuthenticityTokenInput />
				<HoneypotInputs />

				<div className="flex w-full flex-col gap-1.5">
					<label htmlFor="code" className="sr-only">
						Code
					</label>
					<Input
						placeholder="Code"
						ref={inputRef}
						required
						className={`bg-transparent ${
							code.errors && 'border-destructive focus-visible:ring-destructive'
						}`}
						{...getInputProps(code, { type: 'text' })}
					/>
				</div>

				<div className="flex flex-col">
					{!authError && code.errors && (
						<span className="text-destructive dark:text-destructive-foreground mb-2 text-sm">
							{code.errors.join(' ')}
						</span>
					)}
					{authEmail && authError && (
						<span className="text-destructive dark:text-destructive-foreground mb-2 text-sm">
							{authError.message}
						</span>
					)}
				</div>

				<Button type="submit" className="w-full">
					Continue
				</Button>
			</Form>

			{/* Request New Code. */}
			{/* Email is already in session, input it's not required. */}
			<Form method="POST" className="flex w-full flex-col">
				<AuthenticityTokenInput />
				<HoneypotInputs />

				<p className="text-primary/60 text-center text-sm font-normal">
					Did not receive the code?
				</p>
				<Button
					type="submit"
					variant="ghost"
					className="w-full hover:bg-transparent"
				>
					Request New Code
				</Button>
			</Form>
		</div>
	)
}
