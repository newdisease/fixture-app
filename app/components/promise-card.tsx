import { format } from 'date-fns'
import { Button } from '~/components/ui/button'
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from '~/components/ui/card'

export interface Promise {
	id: string
	title: string
	description: string
	deadline: string
	isCompleted: boolean
	createdAt: string
	updatedAt: string
	creatorId: string
	subscriptions: unknown[]
}

export interface PromiseCardProps {
	promise: Promise
	onComplete?: (id: string) => void
}

export function PromiseCard({ promise, onComplete }: PromiseCardProps) {
	const deadlineFormatted = format(
		new Date(promise.deadline),
		'dd MMM yyyy, HH:mm',
	)

	const subscriberCount = promise.subscriptions.length

	return (
		<Card className="max-w-md shadow-sm">
			<CardHeader>
				<CardTitle className="text-lg font-bold">{promise.title}</CardTitle>
				<CardDescription className="text-sm text-muted-foreground">
					{promise.description}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-2">
				<div>
					<span className="font-medium">Deadline: </span>
					<span>{deadlineFormatted}</span>
				</div>
				<div>
					<span className="font-medium">Status: </span>
					<span
						className={
							promise.isCompleted ? 'text-green-600' : 'text-orange-600'
						}
					>
						{promise.isCompleted ? 'Completed' : 'Pending'}
					</span>
				</div>
				<div>
					<span className="font-medium">Subscribers: </span>
					<span>{subscriberCount}</span>
				</div>
			</CardContent>
			{onComplete && !promise.isCompleted && (
				<CardFooter className="flex justify-end">
					<Button
						onClick={() => onComplete(promise.id)}
						variant="outline"
						size="sm"
					>
						Mark as Complete
					</Button>
				</CardFooter>
			)}
		</Card>
	)
}
