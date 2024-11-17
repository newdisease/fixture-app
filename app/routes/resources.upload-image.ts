import { type SubmissionResult } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import {
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
  MaxPartSizeExceededError,
} from '@remix-run/node'
import type { ActionFunctionArgs } from '@remix-run/router'
import sharp from 'sharp'
import { z } from 'zod'

import { requireUser } from '~/modules/auth/auth.server'
import { prisma } from '~/utils/db.server'
import { createToastHeaders } from '~/utils/toast.server'

export const ROUTE_PATH = '/resources/upload-image' as const
export const MAX_FILE_SIZE = 1024 * 1024 * 3 // 3MB
export const MAX_THUMBNAIL_DIMENSION = 200 // Maximum width or height for the resized thumbnail.

export const ImageSchema = z.object({
  imageFile: z.instanceof(File).refine((file) => file.size > 0, 'Image is required.'),
})

export async function action({ request }: ActionFunctionArgs) {
  try {
    const user = await requireUser(request)

    const formData = await unstable_parseMultipartFormData(
      request,
      unstable_createMemoryUploadHandler({ maxPartSize: MAX_FILE_SIZE }),
    )
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
    if (error instanceof MaxPartSizeExceededError) {
      const result: SubmissionResult = {
        initialValue: {},
        status: 'error',
        error: {
          imageFile: ['Image size must be less than 2MB.'],
        },
        state: {
          validated: {
            imageFile: true,
          },
        },
      }
      return Response.json(result, { status: 400 })
    } else {
      console.error('Error processing image:', error)
      throw error
    }
  }
}
