import { z } from 'zod'

const schema = z.object({
	NODE_ENV: z.enum(['production', 'development', 'test'] as const),
	SESSION_SECRET: z.string(),
	DATABASE_URL: z.string(),
	GOOGLE_CLIENT_SECRET: z.string(),
	GOOGLE_CLIENT_ID: z.string(),
	ENCRYPTION_SECRET: z.string().optional(),
	DEV_HOST_URL: z.string().optional(),
	PROD_HOST_URL: z.string().optional(),
	HONEYPOT_ENCRYPTION_SEED: z.string().optional(),
})

declare global {
	namespace NodeJS {
		interface ProcessEnv extends z.infer<typeof schema> {}
	}
}

export function initEnvs() {
	const parsed = schema.safeParse(process.env)

	if (parsed.success === false) {
		console.error(
			'Invalid environment variables:',
			parsed.error.flatten().fieldErrors,
		)
		throw new Error('Invalid environment variables.')
	}
}
