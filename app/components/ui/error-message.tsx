import { type PropsWithChildren } from 'react'
import { cn } from '~/utils/misc'

type ErrorMessageProps = PropsWithChildren & {
	className?: string
}

/**
 * Renders an error message with a destructive color. Useful for form validation errors.
 * @param className - Additional classes to apply to the error message.
 */
function ErrorMessage({ children, className }: ErrorMessageProps) {
	return (
		<span
			className={cn(
				'text-destructive dark:text-destructive-foreground mb-2 text-sm',
				className,
			)}
		>
			{children}
		</span>
	)
}

ErrorMessage.displayName = 'ErrorMessage'

export { ErrorMessage }
