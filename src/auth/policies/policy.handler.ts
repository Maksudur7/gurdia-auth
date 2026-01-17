export interface PolicyContext {
    user: any;
    resource?: any;
    action: string;
}

export class PolicyEngine {
    static evaluate(context: PolicyContext): boolean {
        const { user, resource, action } = context;

        if (user.status === 'BLOCKED') return false;

        if (user.status === 'SUSPENDED' && action !== 'read') {
            return false;
        }

        if (user.role === 'ADMIN') return true;

        if (user.role === 'USER' && resource) {
            return user.internal_id === resource.userId;
        }

        return true;
    }
}