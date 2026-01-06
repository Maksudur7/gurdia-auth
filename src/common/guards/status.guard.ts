import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class StatusGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const { user } = context.switchToHttp().getRequest();

        if (!user) return false;

        if (user.status === 'BLOCKED') {
            throw new ForbiddenException('Your account is blocked. Please contact support.');
        }

        if (user.status === 'DORMANT') {
            throw new ForbiddenException('Account is dormant. Please log in to recover your account.');
        }

        const request = context.switchToHttp().getRequest();
        if (user.status === 'SUSPENDED' && request.method !== 'GET') {
            throw new ForbiddenException('Suspended accounts have read-only access.');
        }

        return true;
    }
}