import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	type MetaFunction,
	Form,
	useActionData,
} from 'react-router'
import { AuthenticityTokenInput } from 'remix-utils/csrf/react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { z } from 'zod'
import { ROUTE_PATH as FEED_PATH } from './feed'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'

import { requireSessionUser } from '~/modules/auth/auth.server'
import { siteConfig } from '~/utils/constants/brand'
import { INTENTS } from '~/utils/constants/misc'
import { validateCSRF } from '~/utils/csrf.server'
import { prisma } from '~/utils/db.server'
import { redirectWithToast } from '~/utils/toast.server'

export const ROUTE_PATH = '/add-new' as const

const TaskSchema = z.object({
	title: z.string().min(1, 'Title is required').max(100),
	description: z.string().min(1, 'Description is required').max(500),
	deadline: z.date({ required_error: 'Deadline is required' }),
})

export const meta: MetaFunction = () => {
	return [{ title: `${siteConfig.siteTitle} | Add a task` }]
}

export async function loader({ request }: LoaderFunctionArgs) {
	await requireSessionUser(request)
}

export async function action({ request }: ActionFunctionArgs) {
	const sessionUser = await requireSessionUser(request)
	const clonedRequest = request.clone()
	const formData = await clonedRequest.formData()
	await validateCSRF(formData, clonedRequest.headers)
	const intent = formData.get(INTENTS.INTENT)

	if (intent === INTENTS.ADD_NEW_TASK) {
		const submission = parseWithZod(formData, { schema: TaskSchema })
		if (submission.status !== 'success') {
			return Response.json(submission.reply(), {
				status: submission.status === 'error' ? 400 : 200,
			})
		}
		const { title, description, deadline } = submission.value
		await prisma.task.create({
			data: {
				title,
				description,
				deadline,
				creatorId: sessionUser.id,
			},
		})

		return redirectWithToast(
			FEED_PATH,
			{
				type: 'success',
				description: 'Task added successfully!',
			},
			request,
		)
	}
}

export default function NewTaskPage() {
	const lastResult = useActionData<typeof action>()

	const [form, { title, description, deadline }] = useForm({
		lastResult,
		constraint: getZodConstraint(TaskSchema),
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: TaskSchema })
		},
	})

	return (
		<div className="m-auto p-9">
			<Form
				method="POST"
				className="border-border bg-card flex flex-col items-start rounded-lg border"
				{...getFormProps(form)}
			>
				<div className="flex w-full flex-col gap-4 rounded-lg p-6">
					<Input
						placeholder="Title"
						autoComplete="off"
						required
						className={`w-80 bg-transparent ${
							title.errors &&
							'border-destructive focus-visible:ring-destructive'
						}`}
						{...getInputProps(title, { type: 'text' })}
					/>
					{title.errors && (
						<p className="text-destructive dark:text-destructive-foreground text-sm">
							{title.errors.join(' ')}
						</p>
					)}
				</div>
				<div className="flex w-full flex-col gap-4 rounded-lg p-6">
					<Textarea
						placeholder="Description"
						autoComplete="off"
						required
						className={`w-80 bg-transparent ${
							description.errors &&
							'border-destructive focus-visible:ring-destructive'
						}`}
						{...getInputProps(description, { type: 'text' })}
					/>
					{description.errors && (
						<p className="text-destructive dark:text-destructive-foreground text-sm">
							{description.errors.join(' ')}
						</p>
					)}
				</div>
				<div className="flex max-w-lg flex-col gap-4 rounded-lg p-6">
					<p className="text-primary/60 text-sm font-normal">Deadline</p>
					<Input
						autoComplete="off"
						required
						className={`w-80 bg-transparent ${
							deadline.errors &&
							'border-destructive focus-visible:ring-destructive'
						}`}
						{...getInputProps(deadline, { type: 'datetime-local' })}
					/>
					{deadline.errors && (
						<p className="text-destructive dark:text-destructive-foreground text-sm">
							{deadline.errors.join(' ')}
						</p>
					)}
				</div>
				<AuthenticityTokenInput />
				<HoneypotInputs />
				<div className="flex w-full justify-start p-6">
					<Button
						type="submit"
						size="sm"
						name={INTENTS.INTENT}
						value={INTENTS.ADD_NEW_TASK}
					>
						Add Task
					</Button>
				</div>
			</Form>
		</div>
	)
}
