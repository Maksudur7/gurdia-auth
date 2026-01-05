import { PrismaClient } from '../../generated/prisma/client.js';


const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;