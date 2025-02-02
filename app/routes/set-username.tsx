import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import {
	type MetaFunction,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
	redirect,
} from '@remix-run/node'
import { Form, useActionData, data } from '@remix-run/react'
import { Loader2 } from 'lucide-react'
import { useRef, useEffect } from 'react'
import { AuthenticityTokenInput } from 'remix-utils/csrf/react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { useHydrated } from 'remix-utils/use-hydrated'
import { z } from 'zod'

import { ROUTE_PATH as DASHBOARD_PATH } from './dashboard'
import { ROUTE_PATH as LOGIN_PATH } from './login'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { requireSessionUser } from '~/modules/auth/auth.server'
import { ERRORS } from '~/utils/constants/errors'
import { validateCSRF } from '~/utils/csrf.server'
import { prisma } from '~/utils/db.server'
import { checkHoneypot } from '~/utils/honeypot.server'
import { useIsPending } from '~/utils/hooks/use-is-pending'

export const ROUTE_PATH = '/set-username' as const

export const UsernameSchema = z.object({
	username: z
		.string()
		.min(3)
		.max(20)
		.toLowerCase()
		.trim()
		.regex(
			/^[a-zA-Z0-9]+$/,
			'Username may only contain alphanumeric characters.',
		),
})

export const meta: MetaFunction = () => {
	return [{ title: 'Fixture - Username' }]
}

export async function loader({ request }: LoaderFunctionArgs) {
	await requireSessionUser(request, { redirectTo: LOGIN_PATH })
	return {}
}

export async function action({ request }: ActionFunctionArgs) {
	const sessionUser = await requireSessionUser(request, {
		redirectTo: LOGIN_PATH,
	})

	const clonedRequest = request.clone()
	const formData = await clonedRequest.formData()
	await validateCSRF(formData, clonedRequest.headers)
	checkHoneypot(formData)

	const submission = parseWithZod(formData, { schema: UsernameSchema })
	if (submission.status !== 'success') {
		return data(submission.reply(), {
			status: submission.status === 'error' ? 400 : 200,
		})
	}

	const { username } = submission.value
	const isUsernameTaken = await prisma.user.findUnique({ where: { username } })

	if (isUsernameTaken) {
		return data(
			submission.reply({
				fieldErrors: {
					username: [ERRORS.ONBOARDING_USERNAME_ALREADY_EXISTS],
				},
			}),
		)
	}
	await prisma.user.update({
		where: { id: sessionUser.id },
		data: { username },
	})

	return redirect(DASHBOARD_PATH)
}

export default function OnboardingUsername() {
	const lastResult = useActionData<typeof action>()
	const inputRef = useRef<HTMLInputElement>(null)
	const isHydrated = useHydrated()
	const isPending = useIsPending()

	const [form, { username }] = useForm({
		lastResult,
		constraint: getZodConstraint(UsernameSchema),
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: UsernameSchema })
		},
	})

	useEffect(() => {
		isHydrated && inputRef.current?.focus()
	}, [isHydrated])

	return (
		<div className="relative flex h-screen w-full bg-card">
			<div className="mx-auto flex h-full w-full max-w-96 flex-col items-center justify-center gap-6">
				<div className="flex flex-col items-center gap-2">
					<span className="mb-2 animate-pulse select-none text-6xl">👋</span>
					<h3 className="text-center text-2xl font-medium text-primary">
						Welcome!
					</h3>
					<p className="text-center text-base font-normal text-primary/60">
						Let&apos;s get started by choosing a username.
					</p>
				</div>

				<Form
					method="POST"
					autoComplete="off"
					className="flex w-full flex-col items-start gap-1"
					{...getFormProps(form)}
				>
					{/* Security */}
					<AuthenticityTokenInput />
					<HoneypotInputs />

					<div className="flex w-full flex-col gap-1.5">
						<label htmlFor="username" className="sr-only">
							Username
						</label>
						<Input
							placeholder="Username"
							autoComplete="off"
							ref={inputRef}
							required
							className={`bg-transparent ${
								username.errors &&
								'border-destructive focus-visible:ring-destructive'
							}`}
							{...getInputProps(username, { type: 'text' })}
						/>
					</div>

					<div className="flex flex-col">
						{username.errors && (
							<span className="mb-2 text-sm text-destructive dark:text-destructive-foreground">
								{username.errors.join(' ')}
							</span>
						)}
					</div>

					<Button type="submit" size="sm" className="w-full">
						{isPending ? <Loader2 className="animate-spin" /> : 'Continue'}
					</Button>
				</Form>
			</div>
		</div>
	)
}
