import { CurrentUserId } from '@/common/decorators/current-user-id.decorator';
import { BaseResponseDto } from '@/common/dtos/base-response.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import {
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Post,
    Query,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiTags
} from '@nestjs/swagger';
import { GetNotificationsQueryDto, NotificationListResponseDto, UnreadCountResponseDto } from './dtos/notification.dto';
import { NotificationTransformInterceptor } from './interceptors/notification-transform.interceptor';
import { NotificationService } from './notification.service';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@UseInterceptors(NotificationTransformInterceptor)
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get notification list',
        description: 'Get paginated list of notifications for the current user',
    })
    @ApiOkResponse({
        description: 'Success',
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
    @ApiOperation({ summary: 'Count unread notifications' })
    @ApiOkResponse({
        status: 200, description: 'Success',
        type: UnreadCountResponseDto,
    })
    async getUnreadCount(
        @CurrentUserId('id') userId: string,
    ): Promise<UnreadCountResponseDto> {
        const count = await this.notificationService.getUnreadCount(userId);
        return { count };
    }

    @Post('mark-all-read')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Mark all notifications as read' })
    @ApiOkResponse({ description: 'Success' })
    async markAllAsRead(
        @CurrentUserId('id') userId: string,
    ): Promise<BaseResponseDto<void>> {
        await this.notificationService.markAllAsRead(userId);
        return { success: true };
    }

    @Post(':id/read')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Mark a notification as read' })
    @ApiOkResponse({ description: 'Success' })
    async markAsRead(
        @Param('id', ParseUUIDPipe) notificationId: string,
        @CurrentUserId('id') userId: string,
    ): Promise<BaseResponseDto<void>> {
        await this.notificationService.markAsRead(notificationId, userId);
        return { success: true };
    }

    // Static route MUST come before /:id to avoid "read" being captured as a UUID param
    @Delete('read')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete all read notifications' })
    @ApiOkResponse({ description: 'Deleted successfully' })
    async deleteReadNotifications(
        @CurrentUserId('id') userId: string,
    ): Promise<BaseResponseDto<void>> {
        await this.notificationService.deleteReadNotifications(userId);
        return { success: true }
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete a notification' })
    @ApiOkResponse({ description: 'Deleted successfully' })
    async deleteNotification(
        @Param('id', ParseUUIDPipe) notificationId: string,
        @CurrentUserId('id') userId: string,
    ): Promise<BaseResponseDto<void>> {
        await this.notificationService.deleteNotification(
            notificationId,
            userId,
        );
        return { success: true }
    }
}
