import { PrismaClient } from '@prisma/client'

import { singleton } from './misc.server'

// Hard-code a unique key, so we can look up the client when this module gets re-imported
const prisma = singleton('prisma', () => new PrismaClient())
// eslint-disable-next-line @typescript-eslint/no-floating-promises
prisma.$connect()

export { prisma }
