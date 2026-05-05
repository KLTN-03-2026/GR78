import { BillingCycle } from '../enums/billing-cycle.enum';
import { SubscriptionPaymentStatus } from '../enums/subscription-payment-status.enum';
import { SubscriptionStatus } from '../enums/subscription-status.enum';

export interface InitTrialInput {
    userId: string;
}

export interface SubscribeInput {
    userId: string;
    planId: string;
    discountCode?: string;
}

export interface ActivateSubscriptionInput {
    subscriptionId: string;
    paymentId: string;
    adminNotes?: string;
}

export interface SubscriptionSummary {
    subscriptionId: string;
    userId: string;
    status: SubscriptionStatus;
    isAccessAllowed: boolean;
    daysUntilExpiry: number;
    trialEndDate?: Date;
    currentPeriodEnd?: Date;
    planName?: string;
    billingCycle?: BillingCycle;
    statusMessage: string;
}

export interface PaymentCreationResult {
    paymentId: string;
    subscriptionId: string;
    amount: number;
    discountAmount: number;
    finalAmount: number;
    status: SubscriptionPaymentStatus;
    dueDate: Date;
    stripePaymentIntentId: string;
    clientSecret: string;
}
