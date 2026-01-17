import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/client.js';

@Injectable()
export class PrismaService extends PrismaClient {
    constructor() {
        const adapterFactory = new PrismaPg({ connectionString: process.env.DATABASE_URL });
        // Note: connect() is async, but PrismaClient accepts the adapter synchronously
        // This is the recommended pattern for Prisma driver adapters
        super({
            adapter: adapterFactory,
            log: [],
        });
    }
}
