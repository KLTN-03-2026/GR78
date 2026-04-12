import { CurrentUserId } from '@/common/decorators/@CurrentUserId';

import { BaseResponseDto } from '@/common/dtos/base-response.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import {
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiTags
} from '@nestjs/swagger';
import { GetNotificationsQueryDto, NotificationListResponseDto, UnreadCountResponseDto } from './dtos/notification.dto';
import { NotificationService } from './notification.service';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'get successful list',
        description: 'get list of successful notifications',
    })
    @ApiOkResponse({
        description: 'success',
        type: NotificationListResponseDto
    })
    async getNotifications(
        @CurrentUserId('id') userId: string,
        @Query() query: GetNotificationsQueryDto,
    ): Promise<NotificationListResponseDto> {
        return await this.notificationService.getUserNotifications(
            userId,
            query.page,
            query.limit,
            query.unreadOnly,
        );
    }

    @Get('unread-count')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'count unread notifications' })
    @ApiOkResponse({
        status: 200, description: 'success',
        type: UnreadCountResponseDto,
    })
    async getUnreadCount(
        @CurrentUserId('id') userId: string,
    ): Promise<UnreadCountResponseDto> {
        const count = await this.notificationService.getUnreadCount(userId);
        return { count };
    }

    @Post(':id/read')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'mark as read' })
    @ApiOkResponse({ description: 'success' })
    async markAsRead(
        @Param('id') notificationId: string,
        @CurrentUserId('id') userId: string,
    ): Promise<BaseResponseDto<void>> {
        await this.notificationService.markAsRead(notificationId, userId);
        return { success: true };
    }

    @Post('mark-all-read')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'mark all read' })
    @ApiOkResponse({ description: 'success' })
    async markAllAsRead(
        @CurrentUserId('id') userId: string,
    ): Promise<BaseResponseDto<void>> {
        await this.notificationService.markAllAsRead(userId);
        return { success: true };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'delete notification' })
    @ApiOkResponse({ description: 'Deleted successfully' })
    async deleteNotification(
        @Param('id') notificationId: string,
        @CurrentUserId('id') userId: string,
    ): Promise<BaseResponseDto<void>> {
        await this.notificationService.deleteNotification(
            notificationId,
            userId,
        );
        return { success: true }
    }

    @Delete('read')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'delete all read receipts' })
    @ApiOkResponse({ description: 'Deleted successfully' })
    async deleteReadNotifications(
        @CurrentUserId('id') userId: string,
    ): Promise<BaseResponseDto<void>> {
        await this.notificationService.deleteReadNotifications(userId);
        return { success: true }
    }
}