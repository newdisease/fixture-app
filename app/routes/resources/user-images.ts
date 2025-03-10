import { type Route } from './+types/user-images'
import { prisma } from '~/utils/db.server'

export async function loader({ params }: Route.LoaderArgs) {
	if (!params.imageId) {
		throw new Response('Image ID is required', { status: 400 })
	}
	const image = await prisma.userImage.findUnique({
		where: { id: params.imageId },
		select: { contentType: true, blob: true },
	})
	if (!image) {
		throw new Response('Not found', { status: 404 })
	}

	return new Response(image.blob, {
		headers: {
			'Content-Type': image.contentType,
			'Content-Length': Buffer.byteLength(image.blob).toString(),
			'Content-Disposition': `inline; filename="${params.imageId}"`,
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	})
}
