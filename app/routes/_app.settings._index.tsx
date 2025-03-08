import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	Form,
	redirect,
	useActionData,
	useFetcher,
	useLoaderData,
} from 'react-router'
import { AuthenticityTokenInput } from 'remix-utils/csrf/react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { z } from 'zod'

import { ROUTE_PATH as FEED_PATH } from './_app.feed'
import { UserAvatar } from '~/components/misc/user-avatar'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'

import { destroySession, requireUser } from '~/modules/auth/auth.server'
import { ROUTE_PATH as RESET_IMAGE_PATH } from '~/routes/resources.reset-image'
import {
	type action as uploadImageAction,
	ROUTE_PATH as UPLOAD_IMAGE_PATH,
	ImageSchema,
} from '~/routes/resources.upload-image'
import { INTENTS } from '~/utils/constants/misc'
import { validateCSRF } from '~/utils/csrf.server'
import { prisma } from '~/utils/db.server'
import { useDoubleCheck } from '~/utils/hooks/use-double-check'
import { createToastHeaders } from '~/utils/toast.server'

export const FullNameSchema = z.object({
	fullName: z
		.string()
		.min(3)
		.max(32)
		.trim()
		.regex(/^[a-zA-Z\s]+$/, 'Name may only contain letters and spaces.'),
})

export async function loader({ request }: LoaderFunctionArgs) {
	const user = await requireUser(request)
	return { user }
}

export async function action({ request }: ActionFunctionArgs) {
	const user = await requireUser(request)
	const clonedRequest = request.clone()
	const formData = await clonedRequest.formData()
	await validateCSRF(formData, clonedRequest.headers)
	const intent = formData.get(INTENTS.INTENT)

	if (intent === INTENTS.USER_UPDATE_FULL_NAME) {
		const submission = parseWithZod(formData, { schema: FullNameSchema })
		if (submission.status !== 'success') {
			return Response.json(submission.reply(), {
				status: submission.status === 'error' ? 400 : 200,
			})
		}

		const { fullName } = submission.value

		await prisma.user.update({ where: { id: user.id }, data: { fullName } })
		return Response.json(submission.reply({ fieldErrors: {} }), {
			headers: await createToastHeaders({
				title: 'Success!',
				description: 'Name updated successfully.',
			}),
		})
	}

	if (intent === INTENTS.USER_DELETE_ACCOUNT) {
		// Delete user and all related data in a transaction
		await prisma.$transaction(async (tx) => {
			// Delete related records.
			await tx.task.deleteMany({ where: { creatorId: user.id } })
			await tx.userImage.deleteMany({ where: { userId: user.id } })
			await tx.subscription.deleteMany({ where: { userId: user.id } })

			// Finally delete the user.
			await tx.user.delete({ where: { id: user.id } })
		})
		const headers = await destroySession(request)
		return redirect(FEED_PATH, { headers })
	}

	throw new Error(`Invalid intent: ${intent}`)
}

export default function DashboardSettings() {
	const { user } = useLoaderData<typeof loader>()
	const lastResult = useActionData<typeof action>()

	const [imageSrc, setImageSrc] = useState<string | null>(null)
	const imageFormRef = useRef<HTMLFormElement>(null)
	const uploadImageFetcher = useFetcher<typeof uploadImageAction>()
	const resetImageFetcher = useFetcher()

	const { doubleCheck, getButtonProps } = useDoubleCheck()

	const [form, { fullName }] = useForm({
		lastResult,
		constraint: getZodConstraint(FullNameSchema),
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: FullNameSchema })
		},
	})
	const [avatarForm, avatarFields] = useForm({
		lastResult: uploadImageFetcher.data,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: ImageSchema })
		},
	})

	return (
		<div className="flex h-full w-full flex-col gap-6">
			{/* Avatar */}
			<uploadImageFetcher.Form
				method="POST"
				action={UPLOAD_IMAGE_PATH}
				encType="multipart/form-data"
				ref={imageFormRef}
				onReset={() => setImageSrc(null)}
				{...getFormProps(avatarForm)}
				className="border-border bg-card flex w-full flex-col items-start rounded-lg border"
			>
				<div className="flex w-full items-start justify-between rounded-lg p-6">
					<div className="flex flex-col gap-2">
						<h2 className="text-primary text-xl font-medium">Your Avatar</h2>
						<p className="text-primary/60 text-sm font-normal">
							This is your avatar. It will be displayed on your profile.
						</p>
					</div>
					<label
						htmlFor={avatarFields.imageFile.id}
						className="group relative flex cursor-pointer rounded-full transition active:scale-95 sm:overflow-hidden"
					>
						<UserAvatar user={user} className="sm:h-20 sm:w-20" />
						<div className="bg-primary/40 absolute z-10 hidden h-full w-full items-center justify-center group-hover:flex">
							<Upload className="text-secondary h-6 w-6" />
						</div>
					</label>
					<input
						{...getInputProps(avatarFields.imageFile, { type: 'file' })}
						accept="image/*"
						className="peer sr-only"
						required
						tabIndex={imageSrc ? -1 : 0}
						onChange={(e) => {
							const file = e.currentTarget.files?.[0]
							if (file) {
								const form = e.currentTarget.form
								if (!form) return
								const reader = new FileReader()
								reader.onload = (readerEvent) => {
									setImageSrc(readerEvent.target?.result?.toString() ?? null)
									void uploadImageFetcher.submit(form)
								}
								reader.readAsDataURL(file)
							}
						}}
					/>
				</div>
				<div className="border-border bg-secondary dark:bg-card flex min-h-14 w-full items-center justify-between rounded-lg rounded-t-none border-t px-6">
					<p className="text-primary/60 text-sm font-normal">
						Click on the avatar to upload a custom one from your files.
					</p>
					{user.image?.id && !avatarFields.imageFile.errors ? (
						<Button
							type="button"
							size="sm"
							variant="secondary"
							onClick={() => {
								void resetImageFetcher.submit(
									{},
									{
										method: 'POST',
										action: RESET_IMAGE_PATH,
									},
								)
								if (imageFormRef.current) {
									imageFormRef.current.reset()
								}
							}}
						>
							Reset
						</Button>
					) : null}
					{avatarFields.imageFile.errors ? (
						<p className="text-destructive dark:text-destructive-foreground text-right text-sm">
							{avatarFields.imageFile.errors.join(' ')}
						</p>
					) : null}
				</div>
			</uploadImageFetcher.Form>

			{/* Full Name */}
			<Form
				method="POST"
				className="border-border bg-card flex w-full flex-col items-start rounded-lg border"
				{...getFormProps(form)}
			>
				<div className="flex w-full flex-col gap-4 rounded-lg p-6">
					<div className="flex flex-col gap-2">
						<h2 className="text-primary text-xl font-medium">Your Name</h2>
						<p className="text-primary/60 text-sm font-normal">
							This is your name. It will be displayed on your profile.
						</p>
					</div>
					<Input
						placeholder="Your name"
						autoComplete="off"
						defaultValue={user?.fullName ?? ''}
						required
						className={`w-80 bg-transparent ${
							fullName.errors &&
							'border-destructive focus-visible:ring-destructive'
						}`}
						{...getInputProps(fullName, { type: 'text' })}
					/>
					{fullName.errors ? (
						<p className="text-destructive dark:text-destructive-foreground text-sm">
							{fullName.errors.join(' ')}
						</p>
					) : null}
					<AuthenticityTokenInput />
					<HoneypotInputs />
				</div>
				<div className="border-border bg-secondary dark:bg-card flex min-h-14 w-full items-center justify-between rounded-lg rounded-t-none border-t px-6">
					<p className="text-primary/60 text-sm font-normal">
						Please use 32 characters at maximum.
					</p>
					<Button
						type="submit"
						size="sm"
						name={INTENTS.INTENT}
						value={INTENTS.USER_UPDATE_FULL_NAME}
					>
						Save
					</Button>
				</div>
			</Form>

			{/* Delete Account */}
			<div className="border-destructive bg-card flex w-full flex-col items-start rounded-lg border">
				<div className="flex flex-col gap-2 p-6">
					<h2 className="text-primary text-xl font-medium">Delete Account</h2>
					<p className="text-primary/60 text-sm font-normal">
						Permanently delete your account.
					</p>
				</div>
				<div className="border-border flex min-h-14 w-full items-center justify-between rounded-lg rounded-t-none border-t bg-red-500/10 px-6 dark:bg-red-500/10">
					<p className="text-primary/60 text-sm font-normal">
						This action cannot be undone, proceed with caution.
					</p>
					<Form method="POST">
						<AuthenticityTokenInput />
						<HoneypotInputs />
						<Button
							type="submit"
							size="sm"
							variant="destructive"
							name={INTENTS.INTENT}
							value={INTENTS.USER_DELETE_ACCOUNT}
							{...getButtonProps()}
						>
							{doubleCheck ? 'Are you sure?' : 'Delete Account'}
						</Button>
					</Form>
				</div>
			</div>
		</div>
	)
}
