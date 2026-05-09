import { ChatService } from '@/modules/chat/chat.service';
import { NotificationEventService } from '@/modules/notifications/services/notification-event.service';
import { QuoteRevision } from '@/modules/quotes/entities/quote-revision.entity';
import { Quote } from '@/modules/quotes/entities/quote.entity';
import { QuoteStatus } from '@/modules/quotes/enums/quote-status.enum';
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CancelOrderDto, CreateOrderDto } from './dtos/order.dto';
import { Order, OrderStatus, PaymentMethod, PaymentStatus } from './entities/order.entity';

@Injectable()
export class OrderService {
    private readonly logger = new Logger(OrderService.name);

    constructor(
        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>,
        private readonly notificationService: NotificationEventService,
        private readonly chatService: ChatService,
        private readonly dataSource: DataSource,
    ) { }

    /**
     * Phase 1 of the direct-acceptance flow:
     * Customer accepts a PENDING quote at the quoted price without negotiation.
     * An order is created immediately in PENDING status; the technician must
     * call confirm-from-quote to activate it (IN_PROGRESS).
     */
    async createOrderFromDirectAcceptance(
        quoteId: string,
        customerId: string,
    ): Promise<Order> {
        return await this.dataSource.transaction(async (manager) => {
            // Acquire a row-level lock without joins: PostgreSQL forbids FOR UPDATE
            // on the nullable side of an outer join.
            const quoteLock = await manager
                .createQueryBuilder(Quote, 'quote')
                .setLock('pessimistic_write')
                .where('quote.id = :id', { id: quoteId })
                .getOne();

            if (!quoteLock) {
                throw new NotFoundException('Quote not found');
            }

            // Load full relations within the same transaction (lock already held above).
            const quote = await manager.findOne(Quote, {
                where: { id: quoteId },
                relations: ['post', 'post.customer', 'provider', 'customRequest'],
            }) as Quote;

            if (quote.status !== QuoteStatus.PENDING) {
                throw new BadRequestException(
                    `Only PENDING quotes can be accepted directly. ` +
                    `Current status: ${quote.status}. Use /quotes/:id/accept-for-chat to negotiate first.`,
                );
            }

            const ownerCustomerId = quote.post?.customerId ?? quote.customRequest?.customerId;
            if (!ownerCustomerId || ownerCustomerId !== customerId) {
                throw new ForbiddenException('You are not the customer for this quote');
            }

            // Idempotency guard
            const existing = await manager.findOne(Order, { where: { quoteId } });
            if (existing) {
                this.logger.warn(`Order already exists for quote ${quoteId}`);
                return existing;
            }

            // Snapshot the current quote terms as a revision (fully within transaction)
            const revision = manager.create(QuoteRevision, {
                quoteId: quote.id,
                price: quote.price,
                description: quote.description,
                terms: quote.terms,
                estimatedDuration: quote.estimatedDuration,
                imageUrls: quote.imageUrls,
                revisionNumber: quote.revisionCount,
                changedBy: customerId,
                changeReason: 'Customer accepted directly at quoted price',
            });
            const savedRevision = await manager.save(QuoteRevision, revision);

            // Advance quote to ORDER_REQUESTED — technician confirmation required
            quote.status = QuoteStatus.ORDER_REQUESTED;
            quote.orderRequestedAt = new Date();
            await manager.save(Quote, quote);

            // Build the order
            const orderNumber = await this.generateOrderNumber(manager);
            const price = parseFloat(quote.price.toString());
            const serviceFee = this.calculateServiceFee(price);
            const totalAmount = price + serviceFee;

            const title = quote.post?.title ?? quote.customRequest?.title ?? 'Đơn dịch vụ';
            const location = quote.post?.location ?? quote.customRequest?.location;
            const scheduledAt = quote.post?.desiredTime ?? quote.customRequest?.desiredTime;

            const order = manager.create(Order, {
                orderNumber,
                customerId,
                providerId: quote.providerId,
                quoteId,
                title,
                description: quote.description,
                price,
                serviceFee,
                totalAmount,
                status: OrderStatus.PENDING,
                paymentStatus: PaymentStatus.PENDING,
                location,
                scheduledAt,
                estimatedDuration: quote.estimatedDuration,
            });

            const saved = await manager.save(Order, order);

            // Link the revision to this order
            savedRevision.usedForOrderId = saved.id;
            savedRevision.usedAt = new Date();
            await manager.save(QuoteRevision, savedRevision);

            this.logger.log(
                `Order ${saved.id} [PENDING] created from direct acceptance ` +
                `(quote: ${quoteId}). Awaiting provider confirmation.`,
            );

            return saved;
        }).then(async (saved) => {
            // Fire notifications after the transaction commits (best-effort)
            try {
                await this.notificationService.notifyOrderAwaitingConfirmation(
                    saved.providerId,
                    saved.customerId,
                    saved.id,
                    saved.title,
                );
            } catch (err) {
                this.logger.warn(`Failed to notify order awaiting confirmation ${saved.id}: ${err}`);
            }
            return saved;
        });
    }

    /**
     * Phase 2 — used by BOTH flows:
     *
     * Direct-acceptance flow: a PENDING order already exists for the quote.
     *   → Activate it to IN_PROGRESS.
     *
     * Chat-negotiation flow: no pre-existing order.
     *   → Create the order directly in IN_PROGRESS.
     *
     * All quote and revision mutations use the transaction manager to prevent
     * deadlocks: the initial FOR UPDATE lock on the quote row would cause any
     * UPDATE via the injected repo (a different DB connection) to block, which
     * then dead-locks against the transaction that is waiting for that UPDATE.
     */
    async createOrderFromQuoteConfirmation(
        quoteId: string,
        providerId: string,
    ): Promise<Order> {
        let isChatNegotiationPath = false;

        const order = await this.dataSource.transaction(async (manager) => {
            // Acquire a row-level lock without joins: PostgreSQL forbids FOR UPDATE
            // on the nullable side of an outer join.
            const quoteLock = await manager
                .createQueryBuilder(Quote, 'quote')
                .setLock('pessimistic_write')
                .where('quote.id = :id', { id: quoteId })
                .getOne();

            if (!quoteLock) {
                throw new NotFoundException('Quote not found');
            }

            // Load full relations within the same transaction (lock already held above).
            const quote = await manager.findOne(Quote, {
                where: { id: quoteId },
                relations: ['post', 'post.customer', 'provider', 'revisions', 'customRequest'],
            }) as Quote;

            if (quote.status !== QuoteStatus.ORDER_REQUESTED) {
                throw new BadRequestException(
                    'Quote must be in ORDER_REQUESTED status. Customer needs to request order first.',
                );
            }

            if (!quote.belongsTo(providerId)) {
                throw new ForbiddenException('You are not the provider of this quote');
            }

            // Use QueryBuilder for the lock: findOne() loads eager relations (customer, provider)
            // via LEFT JOINs, and PostgreSQL forbids FOR UPDATE on the nullable side of an outer join.
            const existingOrder = await manager
                .createQueryBuilder(Order, 'order')
                .setLock('pessimistic_write')
                .where('order.quoteId = :quoteId', { quoteId })
                .getOne();

            // ── Direct-acceptance path: activate the pre-created PENDING order ──
            if (existingOrder) {
                if (existingOrder.status === OrderStatus.CANCELLED) {
                    throw new BadRequestException(
                        'The order for this quote was cancelled before you confirmed. Please contact the customer.',
                    );
                }

                if (existingOrder.status !== OrderStatus.PENDING) {
                    this.logger.warn(
                        `Order ${existingOrder.id} for quote ${quoteId} is already ${existingOrder.status}`,
                    );
                    return existingOrder;
                }

                existingOrder.status = OrderStatus.IN_PROGRESS;
                existingOrder.startedAt = new Date();
                const activated = await manager.save(Order, existingOrder);

                quote.status = QuoteStatus.CONFIRMED;
                quote.confirmedAt = new Date();
                await manager.save(Quote, quote);

                this.logger.log(
                    `Order ${activated.id} [IN_PROGRESS] activated by provider ${providerId} ` +
                    `(direct-acceptance flow, quote: ${quoteId})`,
                );

                return activated;
            }

            // ── Chat-negotiation path: create the order from scratch ──
            isChatNegotiationPath = true;

            // Use the revisions already loaded with the quote to avoid an extra
            // injected-repo query inside this transaction.
            const revisions = (quote.revisions ?? []).sort(
                (a, b) => b.revisionNumber - a.revisionNumber,
            );
            const currentRevision = revisions[0];
            if (!currentRevision) {
                throw new NotFoundException(`No revision found for quote ${quoteId}`);
            }

            if (currentRevision.usedForOrderId) {
                throw new BadRequestException(
                    `This quote revision has already been used for order ${currentRevision.usedForOrderId}`,
                );
            }

            // Update quote status through the transaction manager — using the injected
            // repo here would attempt to UPDATE the row already locked FOR UPDATE on
            // this same connection, causing a PostgreSQL deadlock.
            quote.status = QuoteStatus.CONFIRMED;
            quote.confirmedAt = new Date();
            await manager.save(Quote, quote);

            const orderNumber = await this.generateOrderNumber(manager);
            const price = parseFloat(quote.price.toString());
            const serviceFee = this.calculateServiceFee(price);
            const totalAmount = price + serviceFee;

            const customerId = quote.post?.customerId ?? quote.customRequest?.customerId ?? '';
            const title = quote.post?.title ?? quote.customRequest?.title ?? 'Đơn dịch vụ';
            const location = quote.post?.location ?? quote.customRequest?.location;
            const scheduledAt = quote.post?.desiredTime ?? quote.customRequest?.desiredTime;

            const newOrder = manager.create(Order, {
                orderNumber,
                customerId,
                providerId: quote.providerId,
                quoteId,
                title,
                description: quote.description,
                price,
                serviceFee,
                totalAmount,
                status: OrderStatus.IN_PROGRESS,
                paymentStatus: PaymentStatus.PENDING,
                location,
                scheduledAt,
                estimatedDuration: quote.estimatedDuration,
                startedAt: new Date(),
            });

            const saved = await manager.save(Order, newOrder);

            // Mark revision as used atomically within the same transaction.
            currentRevision.usedForOrderId = saved.id;
            currentRevision.usedAt = new Date();
            await manager.save(QuoteRevision, currentRevision);

            this.logger.log(
                `Order ${saved.id} [IN_PROGRESS] created by provider ${providerId} ` +
                `(chat-negotiation flow, quote: ${quoteId}, revision: ${currentRevision.revisionNumber})`,
            );

            return saved;
        });

        if (isChatNegotiationPath) {
            try {
                await this.notificationService.notifyOrderCreated(
                    order.providerId,
                    order.customerId,
                    order.id,
                    order.title,
                );
            } catch (err) {
                this.logger.warn(`Failed to send order-created notification for ${order.id}: ${err}`);
            }
        }

        try {
            await this.notificationService.notifyOrderInProgress(
                order.customerId,
                order.id,
                order.title,
            );
        } catch (err) {
            this.logger.warn(`Failed to send order-in-progress notification for ${order.id}: ${err}`);
        }

        return order;
    }


    async createDirectOrder(
        customerId: string,
        dto: CreateOrderDto,
    ): Promise<Order> {
        if (customerId === dto.providerId) {
            throw new BadRequestException('Cannot create order with yourself');
        }


        const orderNumber = await this.generateOrderNumber();
        const price = dto.price;
        const serviceFee = this.calculateServiceFee(price);
        const totalAmount = price + serviceFee;

        const order = this.orderRepo.create({
            orderNumber,
            customerId,
            providerId: dto.providerId,
            title: dto.title,
            description: dto.description,
            price,
            serviceFee,
            totalAmount,
            status: OrderStatus.PENDING,
            paymentStatus: PaymentStatus.PENDING,
            location: dto.location,
            scheduledAt: dto.scheduledAt,
            estimatedDuration: dto.estimatedDuration,
            notes: dto.notes,
        });

        const saved = await this.orderRepo.save(order);

        try {
            await this.chatService.createDirectConversation(customerId, dto.providerId);
        } catch (err) {
            this.logger.warn(`Failed to create conversation for order ${saved.id}: ${err}`);
        }

        await this.notificationService.notifyOrderCreated(
            saved.providerId,
            saved.customerId,
            saved.id,
            saved.title,
        );

        this.logger.log(`Direct order created: ${saved.id}`);
        return saved;
    }


    async startOrder(orderId: string, providerId: string): Promise<Order> {
        const order = await this.orderRepo.findOne({
            where: { id: orderId },
            relations: ['quote'],
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (!order.belongsToProvider(providerId)) {
            throw new ForbiddenException('You are not the provider of this order');
        }

        if (order.quoteId) {
            throw new BadRequestException(
                'Cannot manually start order created from quote. It starts automatically.'
            );
        }

        if (!order.isPending()) {
            throw new BadRequestException('Order must be in pending status to start');
        }

        order.status = OrderStatus.IN_PROGRESS;
        order.startedAt = new Date();

        const saved = await this.orderRepo.save(order);

        await this.notificationService.notifyOrderInProgress(
            order.customerId,
            order.id,
            order.title,
        );

        this.logger.log(`Order started: ${orderId}`);
        return saved;
    }


    async providerCompleteOrder(
        orderId: string,
        providerId: string,
    ): Promise<Order> {
        const order = await this.orderRepo.findOne({
            where: { id: orderId },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (!order.belongsToProvider(providerId)) {
            throw new ForbiddenException('You are not the provider of this order');
        }

        if (!order.canProviderComplete()) {
            throw new BadRequestException(
                'Cannot complete order. Order must be in progress and not already completed.'
            );
        }

        order.providerCompletedAt = new Date();

        const saved = await this.orderRepo.save(order);

        await this.notificationService.notifyProviderCompleted(
            order.customerId,
            order.id,
            order.title,
        );

        this.logger.log(`Provider completed order: ${orderId}`);
        return saved;
    }


    async customerCompleteOrder(
        orderId: string,
        customerId: string,
    ): Promise<Order> {
        const order = await this.orderRepo.findOne({
            where: { id: orderId },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (!order.belongsToCustomer(customerId)) {
            throw new ForbiddenException('You are not the customer of this order');
        }

        if (!order.canCustomerComplete()) {
            throw new BadRequestException(
                'Provider must complete the order first, and order must be in progress'
            );
        }

        order.customerCompletedAt = new Date();
        order.completedAt = new Date();
        order.status = OrderStatus.COMPLETED;

        const saved = await this.orderRepo.save(order);

        await this.notificationService.notifyOrderCompleted(
            order.customerId,
            order.id,
            order.title,
            false,
        );

        await this.notificationService.notifyOrderCompleted(
            order.providerId,
            order.id,
            order.title,
            true,
        );

        try {
            await this.chatService.createOrderConversation(
                saved.id,
                saved.customerId,
                saved.providerId,
                saved.title,
            );
        } catch (err) {
            this.logger.warn(`Failed to create post-order conversation for order ${orderId}: ${err}`);
        }

        this.logger.log(`Order completed: ${orderId}`);
        return saved;
    }

    /**
     * Provider declines to confirm a PENDING order created from direct acceptance.
     * Cancels the order and resets the associated quote so the customer is clearly informed.
     */
    async providerDeclineOrder(
        orderId: string,
        providerId: string,
        dto: CancelOrderDto,
    ): Promise<Order> {
        return await this.dataSource.transaction(async (manager) => {
            const order = await manager
                .createQueryBuilder(Order, 'order')
                .setLock('pessimistic_write')
                .where('order.id = :id', { id: orderId })
                .getOne();

            if (!order) {
                throw new NotFoundException('Order not found');
            }

            if (!order.belongsToProvider(providerId)) {
                throw new ForbiddenException('You are not the provider of this order');
            }

            if (order.status !== OrderStatus.PENDING) {
                throw new BadRequestException(
                    `Only PENDING orders can be declined. Current status: ${order.status}. ` +
                    `Use the cancel endpoint to cancel an in-progress order.`,
                );
            }

            if (!order.quoteId) {
                throw new BadRequestException(
                    'Only quote-based orders can be declined via this endpoint.',
                );
            }

            const reason = dto.reason ?? 'Provider declined to confirm the order';

            order.status = OrderStatus.CANCELLED;
            order.cancelledAt = new Date();
            order.cancelledBy = providerId;
            order.cancellationReason = reason;
            const cancelled = await manager.save(Order, order);

            // Reset the quote so the state is consistent
            const quote = await manager.findOne(Quote, {
                where: { id: order.quoteId },
                lock: { mode: 'pessimistic_write' },
            });
            if (quote && quote.status === QuoteStatus.ORDER_REQUESTED) {
                quote.status = QuoteStatus.CANCELLED;
                quote.cancelledAt = new Date();
                quote.cancellationReason = reason;
                await manager.save(Quote, quote);
            }

            this.logger.log(`Order ${orderId} declined by provider ${providerId}`);
            return cancelled;
        }).then(async (cancelled) => {
            try {
                await this.notificationService.notifyProviderDeclinedOrder(
                    cancelled.customerId,
                    cancelled.id,
                    cancelled.title,
                    dto.reason,
                );
            } catch (err) {
                this.logger.warn(`Failed to notify provider declined order ${cancelled.id}: ${err}`);
            }
            return cancelled;
        });
    }

    async cancelOrder(
        orderId: string,
        userId: string,
        dto: CancelOrderDto,
    ): Promise<Order> {
        return await this.dataSource.transaction(async (manager) => {
            const order = await manager
                .createQueryBuilder(Order, 'order')
                .setLock('pessimistic_write')
                .where('order.id = :id', { id: orderId })
                .getOne();

            if (!order) {
                throw new NotFoundException('Order not found');
            }

            if (!order.isParticipant(userId)) {
                throw new ForbiddenException('You are not a participant in this order');
            }

            if (order.status === OrderStatus.COMPLETED) {
                throw new BadRequestException('Cannot cancel a completed order');
            }

            if (!order.canCancel()) {
                throw new BadRequestException(
                    'Cannot cancel order after 10 minutes from start time',
                );
            }

            const wasPending = order.status === OrderStatus.PENDING;

            order.status = OrderStatus.CANCELLED;
            order.cancelledAt = new Date();
            order.cancelledBy = userId;
            order.cancellationReason = dto.reason;
            const saved = await manager.save(Order, order);

            // If a PENDING quote-based order is cancelled, reset the quote to CANCELLED
            // so the state remains consistent and the provider is not left with a stale ORDER_REQUESTED quote
            if (order.quoteId && wasPending) {
                const quote = await manager.findOne(Quote, {
                    where: { id: order.quoteId },
                    lock: { mode: 'pessimistic_write' },
                });
                if (quote && quote.status === QuoteStatus.ORDER_REQUESTED) {
                    quote.status = QuoteStatus.CANCELLED;
                    quote.cancelledAt = new Date();
                    quote.cancellationReason = dto.reason ?? 'Order cancelled by participant before confirmation';
                    await manager.save(Quote, quote);
                }
            }

            this.logger.log(`Order ${orderId} cancelled by ${userId}`);
            return saved;
        }).then(async (saved) => {
            try {
                const otherUserId = userId === saved.customerId ? saved.providerId : saved.customerId;
                await this.notificationService.notifyOrderCancelled(
                    otherUserId,
                    saved.id,
                    saved.title,
                    dto.reason ?? 'No reason provided',
                );
            } catch (err) {
                this.logger.warn(`Failed to notify order cancelled ${saved.id}: ${err}`);
            }
            return saved;
        });
    }


    async getUserOrders(userId: string, status?: OrderStatus): Promise<Order[]> {
        const queryBuilder = this.orderRepo
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.customer', 'customer')
            .leftJoinAndSelect('order.provider', 'provider')
            .leftJoinAndSelect('order.quote', 'quote')
            .where('order.customerId = :userId OR order.providerId = :userId', { userId });

        if (status) {
            queryBuilder.andWhere('order.status = :status', { status });
        }

        return await queryBuilder
            .orderBy('order.createdAt', 'DESC')
            .getMany();
    }

    async getOrderById(orderId: string, userId: string): Promise<Order> {
        const order = await this.orderRepo.findOne({
            where: { id: orderId },
            relations: ['customer', 'provider', 'quote', 'quote.revisions'],
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (!order.isParticipant(userId)) {
            throw new ForbiddenException('You are not a participant in this order');
        }

        return order;
    }

    async getOrderByNumber(orderNumber: string, userId: string): Promise<Order> {
        const order = await this.orderRepo.findOne({
            where: { orderNumber },
            relations: ['customer', 'provider', 'quote'],
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (!order.isParticipant(userId)) {
            throw new ForbiddenException('You are not a participant in this order');
        }

        return order;
    }

    async getOrderStats(userId: string) {
        const orders = await this.getUserOrders(userId);

        return {
            total: orders.length,
            pending: orders.filter((o) => o.status === OrderStatus.PENDING).length,
            inProgress: orders.filter((o) => o.status === OrderStatus.IN_PROGRESS).length,
            completed: orders.filter((o) => o.status === OrderStatus.COMPLETED).length,
            cancelled: orders.filter((o) => o.status === OrderStatus.CANCELLED).length,
        };
    }

    /**
     * Returns PENDING quote-based orders that require the provider's explicit
     * confirmation or rejection (created via the direct-acceptance flow).
     * Results are ordered oldest-first so the most time-sensitive appear first.
     */
    async getOrdersAwaitingProviderConfirmation(
        providerId: string,
        page: number,
        limit: number,
    ): Promise<{
        data: Order[];
        meta: { total: number; page: number; limit: number; totalPages: number };
    }> {
        const skip = (page - 1) * limit;

        const [data, total] = await this.orderRepo
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.customer', 'customer')
            .leftJoinAndSelect('order.quote', 'quote')
            .where('order.providerId = :providerId', { providerId })
            .andWhere('order.status = :status', { status: OrderStatus.PENDING })
            .andWhere('order.quoteId IS NOT NULL')
            .orderBy('order.createdAt', 'ASC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }


    async updatePaymentMethod(
        orderId: string,
        customerId: string,
        paymentMethod: PaymentMethod,
    ): Promise<Order> {
        const order = await this.orderRepo.findOne({
            where: { id: orderId },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (!order.belongsToCustomer(customerId)) {
            throw new ForbiddenException('You are not the customer of this order');
        }

        if (order.paymentStatus === PaymentStatus.PAID) {
            throw new BadRequestException('Order is already paid');
        }

        if (order.status === OrderStatus.CANCELLED) {
            throw new BadRequestException('Cannot update payment method of cancelled order');
        }

        order.paymentMethod = paymentMethod;

        const saved = await this.orderRepo.save(order);

        this.logger.log(`Payment method updated for order ${orderId}: ${paymentMethod}`);
        return saved;
    }

    async confirmPayment(orderId: string, customerId: string): Promise<Order> {
        const order = await this.orderRepo.findOne({
            where: { id: orderId },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (!order.belongsToCustomer(customerId)) {
            throw new ForbiddenException('You are not the customer of this order');
        }

        if (order.paymentStatus === PaymentStatus.PAID) {
            throw new BadRequestException('Order is already paid');
        }

        if (order.status !== OrderStatus.COMPLETED) {
            throw new BadRequestException('Can only pay for completed orders');
        }

        order.paymentStatus = PaymentStatus.PAID;
        order.paidAt = new Date();

        const saved = await this.orderRepo.save(order);

        await this.notificationService.notifyPaymentReceived(
            order.providerId,
            order.totalAmount,
            order.id,
        );

        this.logger.log(`Payment confirmed for order: ${orderId}`);
        return saved;
    }

    async updateNotes(orderId: string, userId: string, notes: string): Promise<Order> {
        const order = await this.orderRepo.findOne({
            where: { id: orderId },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (!order.isParticipant(userId)) {
            throw new ForbiddenException('You are not a participant in this order');
        }

        order.notes = notes;
        order.updatedAt = new Date();

        const saved = await this.orderRepo.save(order);

        this.logger.log(`Notes updated for order ${orderId}`);
        return saved;
    }


    private async generateOrderNumber(manager?: any): Promise<string> {
        const repo = manager ? manager.getRepository(Order) : this.orderRepo;

        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');

        const count = await repo
            .createQueryBuilder('order')
            .where('order.order_number LIKE :prefix', {
                prefix: `ORD-${dateStr}-%`,
            })
            .getCount();

        const sequence = (count + 1).toString().padStart(4, '0');
        return `ORD-${dateStr}-${sequence}`;
    }

    private calculateServiceFee(price: number): number {
        const feeRate = 0.1; // 10%
        return Math.round(price * feeRate);
    }
}