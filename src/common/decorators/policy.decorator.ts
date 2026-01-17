import { SetMetadata } from '@nestjs/common';

export const CHECK_POLICIES = 'check_policies';
export const CheckPolicies = (...handlers: any[]) => SetMetadata(CHECK_POLICIES, handlers);