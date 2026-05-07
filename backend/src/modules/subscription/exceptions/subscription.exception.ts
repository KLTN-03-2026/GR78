import { ForbiddenException, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';

export class SubscriptionRequiredException extends ForbiddenException {
    constructor(message = 'An active subscription is required to access this feature') {
        super({ code: 'SUBSCRIPTION_REQUIRED', message });
    }
}

export class SubscriptionTrialExpiredException extends ForbiddenException {
    constructor() {
        super({
            code: 'SUBSCRIPTION_TRIAL_EXPIRED',
            message: 'Your free trial has expired. Please subscribe to continue using the platform.',
        });
    }
}

export class SubscriptionExpiredException extends ForbiddenException {
    constructor() {
        super({
            code: 'SUBSCRIPTION_EXPIRED',
            message: 'Your subscription has expired. Please renew to continue.',
        });
    }
}

export class SubscriptionNotFoundException extends NotFoundException {
    constructor() {
        super({ code: 'SUBSCRIPTION_NOT_FOUND', message: 'Subscription not found' });
    }
}

export class SubscriptionPlanNotFoundException extends NotFoundException {
    constructor(id?: string) {
        super({
            code: 'SUBSCRIPTION_PLAN_NOT_FOUND',
            message: id ? `Subscription plan '${id}' not found` : 'Subscription plan not found',
        });
    }
}

export class DiscountNotFoundException extends NotFoundException {
    constructor(code?: string) {
        super({
            code: 'DISCOUNT_NOT_FOUND',
            message: code ? `Discount code '${code}' not found` : 'Discount not found',
        });
    }
}

export class InvalidDiscountException extends BadRequestException {
    constructor(message = 'The discount code is invalid or has expired') {
        super({ code: 'INVALID_DISCOUNT', message });
    }
}

export class SubscriptionAlreadyActiveException extends ConflictException {
    constructor() {
        super({
            code: 'SUBSCRIPTION_ALREADY_ACTIVE',
            message: 'You already have an active subscription',
        });
    }
}

export class PendingPaymentExistsException extends ConflictException {
    constructor() {
        super({
            code: 'PENDING_PAYMENT_EXISTS',
            message: 'You already have a pending payment for this subscription. Please complete or cancel it first.',
        });
    }
}

export class PaymentNotFoundException extends NotFoundException {
    constructor() {
        super({ code: 'PAYMENT_NOT_FOUND', message: 'Payment record not found' });
    }
}

export class DiscountCodeAlreadyExistsException extends ConflictException {
    constructor(code: string) {
        super({
            code: 'DISCOUNT_CODE_EXISTS',
            message: `Discount code '${code}' already exists`,
        });
    }
}
