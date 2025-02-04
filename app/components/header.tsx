import { useLocation } from '@remix-run/react'

type HeaderItem = {
	path: string
	label: string
	description: string
}

type HeaderProps = {
	headerItems: HeaderItem[]
}

export function Header({ headerItems }: HeaderProps) {
	const location = useLocation()
	const currentRoute = headerItems.find(
		(route) => route.path === location.pathname,
	)

	if (!currentRoute) {
		return null
	}

	const { label, description } = currentRoute

	return (
		<header className="z-10 flex w-full flex-col border-b border-border bg-card px-6">
			<div className="mx-auto flex w-full max-w-screen-xl items-center justify-between py-12">
				<div className="flex flex-col items-start gap-2">
					<h1 className="text-3xl font-medium text-primary/80">{label}</h1>
					<p className="text-base font-normal text-primary/60">{description}</p>
				</div>
			</div>
		</header>
	)
}
