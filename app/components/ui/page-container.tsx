import { type ReactNode, type PropsWithChildren } from 'react'

interface PageContainerProps extends PropsWithChildren {
	footer?: ReactNode
}

export default function PageContainer({
	children,
	footer,
}: PageContainerProps) {
	return (
		<div className="flex min-h-[100vh] w-full flex-col bg-secondary dark:bg-black">
			<main className="flex-grow">{children}</main>
			{footer}
		</div>
	)
}
