import { ModerationService } from '@/modules/moderation/moderation.service';
import { UserRepository } from '@/modules/users/repositorys/user.repository';
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CreatePostDto, UpdatePostDto } from '../dtos/post.dto';
import { PostCustomer } from '../entities/post.entity';
import { PostRepository } from '../repositories/post.repository';


export interface ModerationContext {
    ipAddress?: string;
    userAgent?: string;
    entityType?: string;
    entityId?: string;
}
@Injectable()
export class PostValidationService {
    constructor(
        private readonly postRepository: PostRepository,
        private readonly userRepository: UserRepository,
        private readonly moderationService: ModerationService,
    ) { }

    async validateUserExists(userId: string): Promise<void> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundException({
                code: 'USER_NOT_FOUND',
                message: 'Customer not found',
            });
        }
    }

    async validatePostExists(postId: string): Promise<PostCustomer> {
        const post = await this.postRepository.findByIdWithRelations(postId);
        if (!post) {
            throw new NotFoundException({
                code: 'POST_NOT_FOUND',
                message: 'Post not found',
            });
        }
        return post;
    }

    async validatePostOwnership(
        postId: string,
    ): Promise<PostCustomer> {
        const post = await this.postRepository.findByIdWithRelations(postId);
        if (!post) {
            throw new NotFoundException({
                code: 'POST_NOT_FOUND',
                message: 'Post not found or you do not have permission to access it',
            });
        }
        return post;
    }

    validateAndParseCursor(cursor?: string): Date | undefined {
        if (!cursor) {
            return undefined;
        }

        const parsedCursor = new Date(cursor);
        if (isNaN(parsedCursor.getTime())) {
            throw new BadRequestException({
                code: 'INVALID_CURSOR',
                message: 'Invalid cursor format. Expected ISO date string',
            });
        }

        return parsedCursor;
    }

    validatePostNotClosed(post: PostCustomer): void {
        if (post.isClosed()) {
            throw new ForbiddenException({
                code: 'POST_ALREADY_CLOSED',
                message: 'Post is already closed',
            });
        }
    }

    validatePostUpdateRules(post: PostCustomer, dto: UpdatePostDto): void {

        if (post.isClosed() && dto.title) {
            throw new ForbiddenException({
                code: 'POST_CLOSED',
                message: 'Cannot update content of a closed post',
            });
        }
    }





    async validateAndModeratePostContent(
        dto: CreatePostDto,
        userId: string,
        context?: ModerationContext,
    ): Promise<void> {
        const moderationResult = await this.moderationService.moderatePostContent(
            dto.title,
            dto.description,
            userId,
            {
                ...context,
                entityType: 'post',
            },
        );

        if (!moderationResult.isAllowed) {
            const violationMessages = moderationResult.violations
                .map(v => `- ${this.getViolationTypeVietnamese(v.type)}: ${v.reason}`)
                .join('\n');

            throw new ForbiddenException({
                code: 'CONTENT_MODERATION_FAILED',
                message: 'Your content violates our community guidelines',
                userMessage: `Nội dung của bạn vi phạm quy định cộng đồng:\n${violationMessages}\n\nVui lòng chỉnh sửa và thử lại.`,
                details: {
                    violations: moderationResult.violations,
                    suggestions: moderationResult.moderatedContent,
                },
            });
        }
    }

    
    async validateAndModeratePostUpdate(
        post: PostCustomer,
        dto: UpdatePostDto,
        userId: string,
        context?: ModerationContext,
    ): Promise<void> {
        const isContentUpdate = dto.title || dto.description;

        if (!isContentUpdate) {
            return;
        }

        const title = dto.title || post.title;
        const description = dto.description || post.description;

        const moderationResult = await this.moderationService.moderatePostContent(
            title,
            description,
            userId,
            {
                ...context,
                entityType: 'post_update',
                entityId: post.id,
            },
        );

        if (!moderationResult.isAllowed) {
            const violationMessages = moderationResult.violations
                .map(v => `- ${this.getViolationTypeVietnamese(v.type)}: ${v.reason}`)
                .join('\n');

            throw new ForbiddenException({
                code: 'CONTENT_MODERATION_FAILED',
                message: 'Your updated content violates our community guidelines',
                userMessage: `Nội dung cập nhật vi phạm quy định cộng đồng:\n${violationMessages}\n\nVui lòng chỉnh sửa và thử lại.`,
                details: {
                    violations: moderationResult.violations,
                    suggestions: moderationResult.moderatedContent,
                },
            });
        }
    }

    
    private getViolationTypeVietnamese(type: string): string {
        const mapping: Record<string, string> = {
            'SEXUAL': 'Nội dung tình dục',
            'VIOLENCE': 'Nội dung bạo lực',
            'HATE': 'Ngôn từ thù hận',
            'HARASSMENT': 'Quấy rối',
            'SELF_HARM': 'Tự gây hại',
            'ILLEGAL': 'Nội dung bất hợp pháp',
        };
        return mapping[type] || type;
    }

}