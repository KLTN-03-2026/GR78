import { UserRole } from '@/common/enums/user-role.enum';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import {
    CanActivate,
    ExecutionContext,
    Injectable,
} from '@nestjs/common';
import { SubscriptionStatus } from '../enums/subscription-status.enum';
import {
    SubscriptionExpiredException,
    SubscriptionRequiredException,
    SubscriptionTrialExpiredException,
} from '../exceptions/subscription.exception';
import { SubscriptionRepository } from '../repositories/subscription.repository';

/**
 * Guard that enforces an active subscription for PROVIDER accounts.
 * CUSTOMER and ADMIN bypass this guard entirely.
 * Apply at controller or handler level after JwtAuthGuard.
 */
@Injectable()
export class SubscriptionActiveGuard implements CanActivate {
    constructor(private readonly subscriptionRepo: SubscriptionRepository) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user as JwtPayload;

        if (!user || user.role !== UserRole.PROVIDER) {
            return true;
        }

        const subscription = await this.subscriptionRepo.findByUserId(user.id);

        if (!subscription) {
            throw new SubscriptionRequiredException();
        }

        switch (subscription.status) {
            case SubscriptionStatus.TRIAL:
                if (!subscription.isTrialActive()) {
                    throw new SubscriptionTrialExpiredException();
                }
                return true;

            case SubscriptionStatus.ACTIVE:
            case SubscriptionStatus.PAST_DUE:
                return true;

            case SubscriptionStatus.EXPIRED:
                if (subscription.trialEndDate && !subscription.planId) {
                    throw new SubscriptionTrialExpiredException();
                }
                throw new SubscriptionExpiredException();

            case SubscriptionStatus.CANCELLED:
                throw new SubscriptionExpiredException();

            default:
                throw new SubscriptionRequiredException();
        }
    }
}
