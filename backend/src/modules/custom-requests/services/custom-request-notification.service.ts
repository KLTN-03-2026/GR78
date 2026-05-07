import { NotificationService } from '@/modules/notifications/notification.service';
import { Injectable, Logger } from '@nestjs/common';
import { CustomRequest } from '../entities/custom-request.entity';

@Injectable()
export class CustomRequestNotificationService {
    private readonly logger = new Logger(CustomRequestNotificationService.name);

    constructor(private readonly notificationService: NotificationService) {}

    async notifyRequestReceived(request: CustomRequest, customerName: string): Promise<void> {
        try {
            await this.notificationService.notifyDirectRequestReceived(request.providerId, {
                customRequestId: request.id,
                requestTitle: request.title,
                customerName,
                budget: request.budget ? parseFloat(request.budget.toString()) : undefined,
            });
        } catch {
            this.logger.error(`Failed to notify direct request received: ${request.id}`);
        }
    }

    async notifyRequestAccepted(request: CustomRequest, providerName: string): Promise<void> {
        try {
            await this.notificationService.notifyDirectRequestAccepted(request.customerId, {
                customRequestId: request.id,
                requestTitle: request.title,
                providerName,
            });
        } catch {
            this.logger.error(`Failed to notify direct request accepted: ${request.id}`);
        }
    }

    async notifyRequestAcceptedWithQuote(
        request: CustomRequest,
        providerName: string,
        quotedPrice: number,
        quoteId: string,
    ): Promise<void> {
        try {
            await this.notificationService.notifyDirectRequestQuoted(request.customerId, {
                customRequestId: request.id,
                requestTitle: request.title,
                providerName,
                quotedPrice,
                quoteId,
            });
        } catch {
            this.logger.error(`Failed to notify direct request quoted: ${request.id}`);
        }
    }

    async notifyRequestRejected(
        request: CustomRequest,
        providerName: string,
        reason?: string,
    ): Promise<void> {
        try {
            await this.notificationService.notifyDirectRequestRejected(request.customerId, {
                customRequestId: request.id,
                requestTitle: request.title,
                providerName,
                reason,
            });
        } catch {
            this.logger.error(`Failed to notify direct request rejected: ${request.id}`);
        }
    }
}
