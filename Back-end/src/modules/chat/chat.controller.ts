import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Query,
    UseGuards
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { CurrentUserId } from '../../common/decorators/@CurrentUserId';
import { ChatService } from './chat.service';
import {
    CreateDirectConversationDto,
    GetMessagesQueryDto,
    SendMessageDto,
} from './dto/chat.dto';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Get('conversations')
    @ApiOperation({ summary: 'Lấy danh sách conversations' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    async getConversations(@CurrentUserId('id') userId: string) {
        return await this.chatService.getUserConversations(userId);
    }

    @Get('conversations/:id')
    @ApiOperation({ summary: 'Xem chi tiết conversation' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    @ApiResponse({ status: 403, description: 'Không có quyền' })
    async getConversation(
        @Param('id') conversationId: string,
        @CurrentUserId('id') userId: string
    ) {
        return await this.chatService.getConversationById(conversationId, userId);
    }

    @Post('conversations/direct')
    @ApiOperation({ summary: 'Tạo conversation riêng với thợ' })
    @ApiResponse({ status: 201, description: 'Tạo thành công' })
    async createDirectConversation(
        @CurrentUserId('id') customerId: string,
        @Body() dto: CreateDirectConversationDto
    ) {
        return await this.chatService.createDirectConversation(
            customerId,
            dto.providerId
        );
    }

    @Post('conversations/:id/messages')
    @ApiOperation({ summary: 'Gửi tin nhắn' })
    @ApiResponse({ status: 201, description: 'Gửi thành công' })
    async sendMessage(
        @Param('id') conversationId: string,
        @CurrentUserId('id') userId: string,
        @Body() dto: SendMessageDto
    ) {
        return await this.chatService.sendMessage(conversationId, userId, dto);
    }

    @Get('conversations/:id/messages')
    @ApiOperation({ summary: 'Lấy tin nhắn của conversation' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    async getMessages(
        @Param('id') conversationId: string,
        @CurrentUserId('id') userId: string,
        @Query() query: GetMessagesQueryDto
    ) {
        return await this.chatService.getMessages(conversationId, userId, query);
    }

    @Post('conversations/:id/read')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Đánh dấu tin nhắn đã đọc' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    async markAsRead(
        @Param('id') conversationId: string,
        @CurrentUserId('id') userId: string
    ) {
        await this.chatService.markMessagesAsRead(conversationId, userId);
        return { success: true };
    }

    @Get('unread-count')
    @ApiOperation({ summary: 'Đếm tổng tin nhắn chưa đọc' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    async getUnreadCount(@CurrentUserId('id') userId: string) {
        const count = await this.chatService.getTotalUnreadCount(userId);
        return { count };
    }

    @Post('conversations/:id/close')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Đóng conversation' })
    @ApiResponse({ status: 200, description: 'Đóng thành công' })
    async closeConversation(
        @Param('id') conversationId: string,
        @CurrentUserId('id') userId: string
    ) {
        await this.chatService.closeConversation(conversationId, userId);
        return { success: true };
    }

    @Delete('conversations/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Xóa conversation' })
    @ApiResponse({ status: 204, description: 'Xóa thành công' })
    async deleteConversation(
        @Param('id') conversationId: string,
        @CurrentUserId('id') userId: string
    ) {
        await this.chatService.deleteConversation(conversationId, userId);
    }
xxư
    @Get('search')
    @ApiOperation({ summary: 'Tìm kiếm tin nhắn' })
    @ApiResponse({ status: 200, description: 'Thành công' })
    async searchMessages(
        @CurrentUserId('id') userId: string,
        @Query('keyword') keyword: string,
        @Query('conversationId') conversationId?: string
    ) {
        return await this.chatService.searchMessages(
            userId,
            keyword,
            conversationId
        );
    }
}
