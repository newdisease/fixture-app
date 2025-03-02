import { type Task, type Subscription, type User } from '@prisma/client'
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

export type TaskCardProps = {
	task: Task & {
		creator: Pick<User, 'fullName'>
		subscriptions: Subscription[]
	}
	onComplete?: (id: string) => void
}

export function TaskCard({ task, onComplete }: TaskCardProps) {
	const {
		id,
		title,
		description,
		deadline,
		isCompleted,
		creator,
		subscriptions,
	} = task
	const deadlineFormatted = format(new Date(deadline), 'dd MMM yyyy, HH:mm')
	const subscriberCount = subscriptions.length

	return (
		<Card className="max-w-md shadow-xs">
			<CardHeader>
				<CardTitle className="text-lg font-bold">{title}</CardTitle>
				<CardDescription className="text-muted-foreground text-sm">
					{description}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-2">
				<div>
					<span className="font-medium">Deadline: </span>
					<span>{deadlineFormatted}</span>
				</div>
				<div>
					<span className="font-medium">Status: </span>
					<span className={isCompleted ? 'text-green-600' : 'text-orange-600'}>
						{isCompleted ? 'Completed' : 'Pending'}
					</span>
				</div>
				<div>
					<span className="font-medium">Subscribers: </span>
					<span>{subscriberCount}</span>
				</div>
				<div>
					<span className="font-medium">Author: </span>
					<span>{creator.fullName ?? 'unknown user'}</span>
				</div>
			</CardContent>
			{onComplete && !isCompleted && (
				<CardFooter className="flex justify-end">
					<Button onClick={() => onComplete(id)} variant="outline" size="sm">
						Mark as Complete
					</Button>
				</CardFooter>
			)}
		</Card>
	)
}
