import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import {Redis} from 'ioredis';

@Injectable()
export class SessionGuard implements CanActivate {
    constructor(@InjectRedis() private readonly redis: Redis) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const user = request.user;
        if (!user) {
            throw new Error('User not authenticated');
        }

        const authHeader = request.headers.authorization;
        if (!authHeader) {
            throw new Error('No token provided');
        }
        const token = authHeader.split(' ')[1];

        const savedToken = await this.redis.get(`session:${user.sub || user.id}`);

        if (!savedToken || token !== savedToken) {
            throw new Error(
                'This session has expired because you logged in from another device.',
            );
        }

        return true;
    }
}