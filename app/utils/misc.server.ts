/**
 * HTTP.
 */
export const HOST_URL =
	process.env.NODE_ENV === 'development'
		? process.env.DEV_HOST_URL
		: process.env.PROD_HOST_URL

export function getDomainUrl(request: Request) {
	const host =
		request.headers.get('X-Forwarded-Host') ?? request.headers.get('Host')
	if (!host) return null

	const protocol = host.includes('localhost') ? 'http' : 'https'
	return `${protocol}://${host}`
}

/**
 * Combines multiple header objects into one (Headers are appended not overwritten).
 */
export function combineHeaders(
	...headers: Array<ResponseInit['headers'] | null | undefined>
) {
	const combined = new Headers()
	for (const header of headers) {
		if (!header) continue
		for (const [key, value] of new Headers(header).entries()) {
			combined.append(key, value)
		}
	}
	return combined
}

/**
 * Singleton Server-Side Pattern.
 */
export const singleton = <Value>(
	name: string,
	valueFactory: () => Value,
): Value => {
	const g = global as unknown as { __singletons: Record<string, unknown> }
	g.__singletons ??= {}
	g.__singletons[name] ??= valueFactory()
	return g.__singletons[name] as Value
}
