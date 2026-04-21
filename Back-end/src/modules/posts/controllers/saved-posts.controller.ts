import { CurrentUser } from '@/common/decorators/@CurrentUser';
import { Roles } from '@/common/decorators/@Roles';
import { UserRole } from '@/common/enums/user-role.enum';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import {
    Body,
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
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
    DeleteSavedPostResponseDto,
    GetSavedPostsQueryDto,
    SavePostDto,
    SavedPostResponseDto,
    SavedPostsListResponseDto,
} from '../dtos/saved-post.dto';
import { SavedPostService } from '../services/saved-post.service';

@ApiTags('Saved Posts')
@Controller('saved-posts')
export class SavedPostsController {
    constructor(private readonly savedPostService: SavedPostService) { }


    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PROVIDER)
    @HttpCode(HttpStatus.CREATED)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Save a post',
        description:
            'Save a public post to your collection for later reference (Provider only)',
    })
    @ApiCreatedResponse({
        description: 'Post saved successfully',
        type: SavedPostResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized - Invalid or missing token',
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Forbidden - Provider role required',
    })
    @ApiNotFoundResponse({
        description: 'Post not found',
    })
    @ApiConflictResponse({
        description: 'Post is already saved',
    })
    async savePost(
        @Body() dto: SavePostDto,
        @CurrentUser() user: JwtPayload,
    ): Promise<SavedPostResponseDto> {
        return this.savedPostService.savePost(user.id, dto.postId);
    }


    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PROVIDER)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get saved posts',
        description:
            'Retrieve all posts saved by the current provider with cursor-based pagination',
    })
    @ApiOkResponse({
        description: 'Saved posts retrieved successfully',
        type: SavedPostsListResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized - Invalid or missing token',
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Forbidden - Provider role required',
    })
    @ApiQuery({ type: GetSavedPostsQueryDto })
    async getSavedPosts(
        @Query() query: GetSavedPostsQueryDto,
        @CurrentUser() user: JwtPayload,
    ): Promise<SavedPostsListResponseDto> {
        return this.savedPostService.getSavedPosts(
            user.id,
            query.limit,
            query.cursor,
        );
    }


    @Get('count')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PROVIDER)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get saved posts count',
        description: 'Get the total number of posts saved by the current provider',
    })
    @ApiOkResponse({
        description: 'Count retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                count: {
                    type: 'number',
                    example: 15,
                },
            },
        },
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized - Invalid or missing token',
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Forbidden - Provider role required',
    })
    async getSavedPostsCount(
        @CurrentUser() user: JwtPayload,
    ): Promise<{ count: number }> {
        const count = await this.savedPostService.countSavedPosts(user.id);
        return { count };
    }


    @Get('check/:postId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PROVIDER)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Check if post is saved',
        description: 'Check whether a specific post is saved by the current provider',
    })
    @ApiOkResponse({
        description: 'Check completed successfully',
        schema: {
            type: 'object',
            properties: {
                postId: {
                    type: 'string',
                    example: '550e8400-e29b-41d4-a716-446655440000',
                },
                isSaved: {
                    type: 'boolean',
                    example: true,
                },
            },
        },
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized - Invalid or missing token',
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Forbidden - Provider role required',
    })
    async checkIfSaved(
        @Param('postId', ParseUUIDPipe) postId: string,
        @CurrentUser() user: JwtPayload,
    ): Promise<{ postId: string; isSaved: boolean }> {
        const isSaved = await this.savedPostService.isSaved(user.id, postId);
        return { postId, isSaved };
    }


    @Delete(':postId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PROVIDER)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Unsave a post',
        description: 'Remove a post from saved collection',
    })
    @ApiOkResponse({
        description: 'Post removed from saved collection',
        type: DeleteSavedPostResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'Unauthorized - Invalid or missing token',
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Forbidden - Provider role required',
    })
    @ApiNotFoundResponse({
        description: 'Saved post not found',
    })
    async unsavePost(
        @Param('postId', ParseUUIDPipe) postId: string,
        @CurrentUser() user: JwtPayload,
    ): Promise<DeleteSavedPostResponseDto> {
        return this.savedPostService.unsavePost(user.id, postId);
    }
}
