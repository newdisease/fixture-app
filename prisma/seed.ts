import { prisma } from '~/utils/db.server'

async function seed() {
	try {
		// Create two users
		const alice = await prisma.user.create({
			data: {
				email: 'alice@example.com',
				fullName: 'Alice Smith',
				username: 'alice',
			},
		})

		const bob = await prisma.user.create({
			data: {
				email: 'bob@example.com',
				fullName: 'Bob Johnson',
				username: 'bob',
			},
		})

		// Create a Promise for Alice
		const promiseAlice = await prisma.promise.create({
			data: {
				title: 'Learn Remix',
				description:
					'Complete the Remix tutorial and build an MVP for Public Promises.',
				// Set deadline to 7 days from now
				deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
				creator: {
					connect: { id: alice.id },
				},
			},
		})

		// Create a Promise for Bob
		const promiseBob = await prisma.promise.create({
			data: {
				title: 'Write a Blog Post',
				description: 'Write a blog post about Prisma and Remix integration.',
				// Set deadline to 14 days from now
				deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
				creator: {
					connect: { id: bob.id },
				},
			},
		})

		// Create subscriptions:
		// Bob subscribes to Alice's promise
		await prisma.subscription.create({
			data: {
				promise: {
					connect: { id: promiseAlice.id },
				},
				user: {
					connect: { id: bob.id },
				},
			},
		})

		// Alice subscribes to Bob's promise
		await prisma.subscription.create({
			data: {
				promise: {
					connect: { id: promiseBob.id },
				},
				user: {
					connect: { id: alice.id },
				},
			},
		})

		console.log('Seed data created successfully')
	} catch (error) {
		console.error('Error seeding data:', error)
		throw error
	}
}

seed()
	.catch(async (e) => {
		console.error(e)
		await prisma.$disconnect()
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
