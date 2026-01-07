import {
    Injectable,
    CanActivate,
    ExecutionContext,
} from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class SessionGuard implements CanActivate {
    constructor(
        @InjectRedis() private readonly redis: Redis,
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const authHeader = request.headers.authorization;
        if (!authHeader) throw new Error('No token provided');
        const token = authHeader.split(' ')[1];

        try {
            const payload = await this.jwtService.verifyAsync(token);
            const userId = payload.sub || payload.id;

            const savedToken = await this.redis.get(`session:${userId}`);
            if (!savedToken || token !== savedToken) {
                throw new Error('This session has expired. Logged in from another device.');
            }

            const dbUser = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { role: true },
            });

            if (!dbUser) throw new Error('User not found');

            request['user'] = dbUser;

            return true;
        } catch (error) {
            throw new Error(error.message || 'Invalid token');
        }
    }
}