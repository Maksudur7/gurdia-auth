import { PrismaClient } from '@prisma/client/extension';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

const prisma = new PrismaClient();

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
    },
    twoFactor: {
        enabled: true,
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7,
        freshAge: 0,
    },
    user: {
        additionalFields: {
            roleId: {
                type: "number",
                required: false,
            },
            status: {
                type: "string",
                defaultValue: "ACTIVE",
            },
            public_id: {
                type: "string",
                required: false,
            }
        }
    }
});