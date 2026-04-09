import { CurrentUser } from '@/common/decorators/@CurrentUser';
import { Roles } from '@/common/decorators/@Roles';

import { UserRole } from '@/common/enums/user-role.enum';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { UploadedFiles } from '@nestjs/common';
import {
    Body,
    Controller,
    Delete,
    Get,
    Headers,
    HttpCode,
    HttpStatus,
    Ip,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiTags
} from '@nestjs/swagger';
import {
    CreatePostDto,
    DeletePostResponseDto,
    FeedResponseDto,
    GetFeedQueryDto,
    PostResponseDto,
    UpdatePostDto,
} from './dtos/post.dto';
import { PostService } from './post.service';
import { ModerationContext } from './services/post-validation.service';

@ApiTags('Posts')
@Controller('posts')
export class PostController {
    constructor(private readonly postService: PostService) { }

    private getRequestContext(
        ipAddress?: string,
        userAgent?: string,
    ): ModerationContext {
        return {
            ipAddress: ipAddress || 'unknown',
            userAgent: userAgent || 'unknown',
        };
    }

    // PUBLIC

    @Get('feed')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get public feed of open posts',
        description:
            'Retrieve paginated list of all open posts from customers. Uses cursor-based pagination for infinite scroll.',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Feed retrieved successfully',
        type: FeedResponseDto,
    })
    @ApiQuery({ type: GetFeedQueryDto })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid cursor format',
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Failed to fetch feed',
    })
    async getFeed(@Query() query: GetFeedQueryDto): Promise<FeedResponseDto> {
        return await this.postService.getFeed(query.limit, query.cursor);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get post by ID',
        description: 'Retrieve detailed information of a specific post',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Post retrieved successfully',
        type: PostResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Post not found',
    })

    async getPostById(
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<PostResponseDto> {
        return await this.postService.getById(id);
    }


    // CUSTOMER
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.CUSTOMER)
    @UseInterceptors(FilesInterceptor('files', 10))
    @HttpCode(HttpStatus.CREATED)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Create new post',
        description: 'Create a new service request post (Customer only)',
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Post created successfully',
        type: PostResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token',
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Forbidden - Customer role required',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid input data',
    })
    async createPost(
        @UploadedFiles() files: Express.Multer.File[],
        @Body() dto: CreatePostDto,
        @CurrentUser() user: JwtPayload,
        //

        @Ip() ipAddress: string,
        @Headers('user-agent') userAgent: string,

    ): Promise<PostResponseDto> {


        const context = this.getRequestContext(ipAddress, userAgent);
        return await this.postService.createWithFiles(dto, files, user, context);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Update post',
        description: 'Update an existing post. Only the post owner can update it.',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Post updated successfully',
        type: PostResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Post not found or you do not have permission',
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Cannot update a closed post',
    })
    async updatePost(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdatePostDto,
        @CurrentUser() user: JwtPayload,

        @Ip() ipAddress: string,
        @Headers('user-agent') userAgent: string,
    ): Promise<PostResponseDto> {
        const context = this.getRequestContext(ipAddress, userAgent);
        return await this.postService.update(id, dto, user, context);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Delete post',
        description: 'Soft delete a post. Only the post owner can delete it.',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Post deleted successfully',
        type: DeletePostResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Post not found or you do not have permission',
    })
    async deletePost(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: JwtPayload,
    ): Promise<DeletePostResponseDto> {
        return await this.postService.delete(id, user);
    }

    @Patch(':id/close')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Close post',
        description:
            'Change post status to CLOSED. Only the post owner can close it.',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Post closed successfully',
        type: PostResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Post not found or you do not have permission',
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Post is already closed',
    })
    async closePost(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: JwtPayload,
    ): Promise<PostResponseDto> {
        return await this.postService.close(id, user);
    }

    @Get('my/posts')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.CUSTOMER)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get my posts',
        description: 'Retrieve all posts created by the current customer',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Posts retrieved successfully',
        type: FeedResponseDto,
    })

    @ApiQuery({ type: GetFeedQueryDto })
    async getMyPosts(
        @Query() query: GetFeedQueryDto,
        @CurrentUser() user: JwtPayload,
    ): Promise<FeedResponseDto> {
        return await this.postService.getMyPosts(user, query.limit, query.cursor);

    }


}