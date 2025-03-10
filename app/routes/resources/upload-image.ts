import { type SubmissionResult } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import sharp from 'sharp'
import { z } from 'zod'

import { type Route } from './+types/upload-image'
import { requireUser } from '~/modules/auth/auth.server'
import { prisma } from '~/utils/db.server'
import { createToastHeaders } from '~/utils/toast.server'

export const ROUTE_PATH = '/resources/upload-image' as const
export const MAX_FILE_SIZE = 1024 * 1024 * 3 // 3MB
export const MAX_THUMBNAIL_DIMENSION = 200 // Maximum width or height for the resized thumbnail.

export const ImageSchema = z.object({
	imageFile: z
		.instanceof(File)
		.refine((file) => file.size > 0, 'Image is required.')
		.refine(
			(file) => file.size <= MAX_FILE_SIZE,
			'Image size must be less than 3MB.',
		),
})

export async function action({ request }: Route.ActionArgs) {
	try {
		const user = await requireUser(request)

		const formData = await request.formData()

		const imageFile = formData.get('imageFile') as File | null
		if (imageFile && imageFile.size > MAX_FILE_SIZE) {
			const result: SubmissionResult = {
				initialValue: {},
				status: 'error',
				error: {
					imageFile: ['Image size must be less than 3MB.'],
				},
				state: {
					validated: {
						imageFile: true,
					},
				},
			}
			return Response.json(result, { status: 400 })
		}

		const submission = await parseWithZod(formData, {
			schema: ImageSchema.transform(async (data) => {
				const arrayBuffer = await data.imageFile.arrayBuffer()
				const buffer = Buffer.from(arrayBuffer)

				const metadata = await sharp(buffer).metadata()

				if (!metadata.width || !metadata.height) {
					throw new Error('Unable to retrieve image dimensions.')
				}

				let processedImageBuffer

				if (metadata.width <= metadata.height) {
					processedImageBuffer = await sharp(buffer)
						.resize({ width: MAX_THUMBNAIL_DIMENSION })
						.toBuffer()
				} else {
					processedImageBuffer = await sharp(buffer)
						.resize({ height: MAX_THUMBNAIL_DIMENSION })
						.toBuffer()
				}

				return {
					image: {
						contentType: data.imageFile.type,
						blob: processedImageBuffer,
					},
				}
			}),
			async: true,
		})

		if (submission.status !== 'success') {
			return Response.json(submission.reply(), {
				status: submission.status === 'error' ? 400 : 200,
			})
		}

		const { image } = submission.value
		await prisma.$transaction(async ($prisma) => {
			await $prisma.userImage.deleteMany({ where: { userId: user.id } })
			await $prisma.user.update({
				where: { id: user.id },
				data: { image: { create: image } },
			})
		})

		return Response.json(submission.reply({ fieldErrors: {} }), {
			headers: await createToastHeaders({
				title: 'Success!',
				description: 'Image uploaded successfully.',
			}),
		})
	} catch (error: unknown) {
		console.error('Error processing image:', error)

		if (error instanceof Error) {
			if (error.message.includes('dimensions')) {
				const result: SubmissionResult = {
					initialValue: {},
					status: 'error',
					error: {
						imageFile: ['Invalid image format.'],
					},
					state: {
						validated: {
							imageFile: true,
						},
					},
				}
				return Response.json(result, { status: 400 })
			}
		}
		throw error
	}
}
