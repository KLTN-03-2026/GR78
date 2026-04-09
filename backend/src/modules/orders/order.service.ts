import { ChatService } from '@/modules/chat/chat.service';
import { NotificationEventService } from '@/modules/notifications/services/notification-event.service';
import { PostCustomer } from '@/modules/posts/entities/post.entity';
import { Quote } from '@/modules/quotes/entities/quote.entity';
import { QuoteStatus } from '@/modules/quotes/enums/quote-status.enum';
import { QuoteRevisionService } from '@/modules/quotes/services/quote-revision.service';
import { QuoteStatusService } from '@/modules/quotes/services/quote-status.service';
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CancelOrderDto, CreateOrderDto } from './dto/order.dto';
import { Order, OrderStatus, PaymentMethod, PaymentStatus } from './entities/order.entity';

@Injectable()
export class OrderService {
    private readonly logger = new Logger(OrderService.name);

    constructor(
        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>,
        @InjectRepository(Quote)
        private readonly quoteRepo: Repository<Quote>,
        @InjectRepository(PostCustomer)
        private readonly postRepo: Repository<PostCustomer>,
        private readonly notificationService: NotificationEventService, 
        private readonly chatService: ChatService,
        private readonly quoteStatusService: QuoteStatusService,
        private readonly quoteRevisionService: QuoteRevisionService,
        private readonly dataSource: DataSource, 
    ) { }

    
    async createOrderFromQuoteConfirmation(
        quoteId: string,
        providerId: string,
    ): Promise<Order> {
        return await this.dataSource.transaction(async (manager) => {
            const quote = await manager.findOne(Quote, {
                where: { id: quoteId },
                relations: ['post', 'post.customer', 'provider', 'revisions'],
                lock: { mode: 'pessimistic_write' },
            });

            if (!quote) {
                throw new NotFoundException('Quote not found');
            }

            if (quote.status !== QuoteStatus.ORDER_REQUESTED) {
                throw new BadRequestException(
                    'Quote must be in ORDER_REQUESTED status. Customer needs to request order first.',
                );
            }

            if (!quote.belongsTo(providerId)) {
                throw new ForbiddenException('You are not the provider of this quote');
            }

            const existing = await manager.findOne(Order, {
                where: { quoteId },
            });

            if (existing) {
                this.logger.warn(`Order already exists for quote ${quoteId}`);
                return existing;
            }

            const currentRevision = await this.quoteRevisionService.getLatestRevision(quoteId);

            if (currentRevision.usedForOrderId) {
                throw new BadRequestException(
                    `This quote revision has already been used for order ${currentRevision.usedForOrderId}`
                );
            }

            await this.quoteStatusService.confirmOrder(quote);

            const orderNumber = await this.generateOrderNumber(manager);
            const price = parseFloat(quote.price.toString());
            const serviceFee = this.calculateServiceFee(price);
            const totalAmount = price + serviceFee;

            const order = manager.create(Order, {
                orderNumber,
                customerId: quote.post.customerId,
                providerId: quote.providerId,
                quoteId,
                title: quote.post.title,
                description: quote.description,
                price,
                serviceFee,
                totalAmount,
                status: OrderStatus.IN_PROGRESS, 
                paymentStatus: PaymentStatus.PENDING,
                location: quote.post.location,
                scheduledAt: quote.post.desiredTime,
                estimatedDuration: quote.estimatedDuration,
                startedAt: new Date(),
            });

            const saved = await manager.save(Order, order);

            await this.quoteRevisionService.markRevisionAsUsedForOrder(
                currentRevision.id,
                saved.id
            );

            await this.notificationService.notifyOrderCreated(
                saved.customerId,
                saved.providerId,
                saved.id,
                saved.title,
            );

            await this.notificationService.notifyOrderInProgress(
                saved.customerId,
                saved.id,
                saved.title,
            );

            this.logger.log(
                `Order created from quote confirmation: ${saved.id} ` +
                `(Quote: ${quoteId}, Revision: ${currentRevision.revisionNumber})`
            );

            return saved;
        });
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
        } catch{
            this.logger.warn(`Failed to create conversation for order ${saved.id}:`);
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

        this.logger.log(`Order completed: ${orderId}`);
        return saved;
    }

    
    async cancelOrder(
        orderId: string,
        userId: string,
        dto: CancelOrderDto,
    ): Promise<Order> {
        const order = await this.orderRepo.findOne({
            where: { id: orderId },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (!order.isParticipant(userId)) {
            throw new ForbiddenException('You are not a participant in this order');
        }

        if (!order.canCancel()) {
            throw new BadRequestException(
                'Cannot cancel order after 10 minutes from start time'
            );
        }

        if (order.status === OrderStatus.COMPLETED) {
            throw new BadRequestException('Cannot cancel completed order');
        }

        order.status = OrderStatus.CANCELLED;
        order.cancelledAt = new Date();
        order.cancelledBy = userId;
        order.cancellationReason = dto.reason;

        const saved = await this.orderRepo.save(order);

        const otherUserId =
            userId === order.customerId ? order.providerId : order.customerId;

        await this.notificationService.notifyOrderCancelled(
            otherUserId,
            order.id,
            order.title,
            dto.reason || 'No reason provided',
        );

        this.logger.log(`Order cancelled: ${orderId} by ${userId}`);
        return saved;
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