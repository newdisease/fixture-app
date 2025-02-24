import { type PropsWithChildren } from 'react'

const PageContainer = ({ children }: PropsWithChildren) => {
	return (
		<div className="flex min-h-dvh w-full flex-col bg-secondary dark:bg-black">
			{children}
		</div>
	)
}

PageContainer.displayName = 'PageContainer'

export { PageContainer }
