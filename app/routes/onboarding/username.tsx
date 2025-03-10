import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { Loader2 } from 'lucide-react'
import { useRef, useEffect } from 'react'
import {
	type MetaFunction,
	type ActionFunctionArgs,
	redirect,
	Form,
	data,
} from 'react-router'
import { AuthenticityTokenInput } from 'remix-utils/csrf/react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { useHydrated } from 'remix-utils/use-hydrated'
import { z } from 'zod'

import { ROUTE_PATH as LOGIN_PATH } from '../auth/login'
import { ROUTE_PATH as FEED_PATH } from '../feed'
import { type Route } from './+types/username'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { requireSessionUser } from '~/modules/auth/auth.server'
import { siteConfig } from '~/utils/constants/brand'
import { ERRORS } from '~/utils/constants/errors'
import { validateCSRF } from '~/utils/csrf.server'
import { prisma } from '~/utils/db.server'
import { checkHoneypot } from '~/utils/honeypot.server'
import { useIsPending } from '~/utils/hooks/use-is-pending'

export const ROUTE_PATH = '/onboarding/username' as const

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
	return [{ title: `Set your username | ${siteConfig.siteTitle}` }]
}

export async function loader({ request }: Route.LoaderArgs) {
	const sessionUser = await requireSessionUser(request, {
		redirectTo: LOGIN_PATH,
	})

	const user = await prisma.user.findUnique({
		where: { id: sessionUser?.id },
	})
	if (user?.username) {
		throw redirect(FEED_PATH)
	}

	return {}
}

export async function action({ request }: ActionFunctionArgs) {
	const sessionUser = await requireSessionUser(request, {
		redirectTo: LOGIN_PATH,
	})

	const clonedRequest = request.clone()
	const formData = await clonedRequest.formData()
	await validateCSRF(formData, clonedRequest.headers)
	await checkHoneypot(formData)

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

	return redirect(FEED_PATH)
}

export default function OnboardingUsername({
	actionData,
}: Route.ComponentProps) {
	const lastResult = actionData
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
		<div className="bg-card relative flex h-screen w-full">
			<div className="mx-auto flex h-full w-full max-w-96 flex-col items-center justify-center gap-6">
				<div className="flex flex-col items-center gap-4">
					<span className="mb-4 animate-bounce text-7xl select-none">🚀</span>
					<h3 className="text-primary text-center text-3xl font-bold">
						Welcome Aboard!
					</h3>
					<p className="text-primary/70 text-center text-lg font-medium">
						Choose a unique username to get started.
					</p>
					<p className="text-primary/50 text-center text-sm font-light">
						Your username will be your unique identity on our platform.
					</p>
				</div>

				<Form
					method="POST"
					autoComplete="off"
					className="flex w-full flex-col items-start gap-4"
					{...getFormProps(form)}
				>
					{/* Security */}
					<AuthenticityTokenInput />
					<HoneypotInputs />

					<div className="flex w-full flex-col">
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
						<div className="h-6">
							{username.errors && (
								<span className="text-destructive dark:text-destructive-foreground text-sm">
									{username.errors.join(' ')}
								</span>
							)}
						</div>
					</div>
					<Button type="submit" size="sm" className="w-full">
						{isPending ? <Loader2 className="animate-spin" /> : 'Continue'}
					</Button>
				</Form>
			</div>
		</div>
	)
}
