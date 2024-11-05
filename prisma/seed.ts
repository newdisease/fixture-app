import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Create a user
    const user = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        username: 'John Doe',
      },
    })

    // Create a related test entry
    await prisma.test.create({
      data: {
        test: 'First Post',
        authorId: user.id, // Use the user's id to associate the test
      },
    })

    console.log('Seed data created successfully')
  } catch (error) {
    console.error('Error seeding data:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
