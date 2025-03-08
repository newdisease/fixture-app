import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { Cookie } from '@mjackson/headers'
import { useRef, useEffect } from 'react'
import {
	type MetaFunction,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
	redirect,
	Form,
	useLoaderData,
	useActionData,
} from 'react-router'
import { AuthenticityTokenInput } from 'remix-utils/csrf/react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { useHydrated } from 'remix-utils/use-hydrated'
import { z } from 'zod'
import { ROUTE_PATH as FEED_PATH } from './_app.feed'
import { ROUTE_PATH as LOGIN_PATH } from './_auth.login'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'

import {
	authenticator,
	getSessionUser,
	TOTP_COOKIE_KEY,
} from '~/modules/auth/auth.server'
import { siteConfig } from '~/utils/constants/brand'
import { validateCSRF } from '~/utils/csrf.server'
import { checkHoneypot } from '~/utils/honeypot.server'
import { useIsPending } from '~/utils/hooks/use-is-pending'

export const ROUTE_PATH = '/verify-code' as const

export const VerifyLoginSchema = z.object({
	code: z.string().min(6, 'Code must be at least 6 characters.'),
})

export const meta: MetaFunction = () => {
	return [{ title: `Verify code | ${siteConfig.siteTitle}` }]
}

export async function loader({ request }: LoaderFunctionArgs) {
	const sessionUser = await getSessionUser(request)

	if (sessionUser) {
		return redirect(FEED_PATH)
	}

	// Get the TOTP cookie and the token from the URL.
	const cookie = new Cookie(request.headers.get('Cookie') || '')
	const totpCookie = cookie.get(TOTP_COOKIE_KEY)

	const url = new URL(request.url)
	const token = url.searchParams.get('t')

	if (token) {
		try {
			return await authenticator.authenticate('TOTP', request)
		} catch (error) {
			if (error instanceof Response) return error
			if (error instanceof Error) return { error: error.message }
			return { error: 'Invalid TOTP' }
		}
	}

	// Get the email from the TOTP cookie.
	let email = null
	if (totpCookie) {
		const params = new URLSearchParams(totpCookie)
		email = params.get('email')
	}

	// If no email is found, redirect to login.
	if (!email) return redirect(LOGIN_PATH)

	return { email }
}

export async function action({ request }: ActionFunctionArgs) {
	const clonedRequest = request.clone()
	const formData = await clonedRequest.formData()
	await validateCSRF(formData, clonedRequest.headers)
	await checkHoneypot(formData)
	try {
		await authenticator.authenticate('TOTP', request)
	} catch (error) {
		if (error instanceof Response) {
			const cookie = new Cookie(error.headers.get('Set-Cookie') || '')
			const totpCookie = cookie.get(TOTP_COOKIE_KEY)
			if (totpCookie) {
				const params = new URLSearchParams(totpCookie)
				return { error: params.get('error') }
			}
			throw error
		}
		return { error: 'Invalid TOTP' }
	}
}

export default function Verify() {
	const loaderData = useLoaderData<typeof loader>()
	const actionData = useActionData<typeof action>()
	const inputRef = useRef<HTMLInputElement>(null)
	const isHydrated = useHydrated()

	const isPending = useIsPending()

	const email = 'email' in loaderData ? loaderData.email : undefined
	const loaderError = 'error' in loaderData ? loaderData.error : null
	const actionError =
		actionData && 'error' in actionData ? actionData.error : null
	const error = loaderError || actionError

	console.log('error', error)

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
					We&apos;ve just sent you a temporary password
					<br />
					at <strong>{email}</strong>.
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
					{(error || code.errors) && (
						<span className="text-destructive dark:text-destructive-foreground mb-2 text-sm">
							{error || code.errors?.join(' ')}
						</span>
					)}
				</div>
				<Button type="submit" className="w-full" disabled={isPending}>
					{isPending ? 'Verifying...' : 'Verify'}
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
