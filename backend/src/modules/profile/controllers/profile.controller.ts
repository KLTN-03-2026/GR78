import { CurrentUser } from '@/common/decorators/@CurrentUser';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Patch,
    Put,
    Query,
    UploadedFile,
    UseGuards, UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import {
    ChangeDisplayNameDto,
    DeleteAccountResponseDto,
    DisplayNameChangeResponseDto,
    ProfileListResponseDto,
    ProfileResponseDto,
    PublicProfileResponseDto,
    SearchProfilesQueryDto,
    UpdateContactDto,
    UpdateProfileDto
} from '../dtos/profile.dto';
import { ProfileService } from '../services/profile.service';
@ApiTags('Profile')
@Controller('profile')
@UseInterceptors(ClassSerializerInterceptor)
export class ProfileController {
    constructor(private readonly profileService: ProfileService,
    ) { }


    @Get('me')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get my profile',
        description: 'Retrieve the authenticated user\'s complete profile information including private data',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Profile retrieved successfully',
        type: ProfileResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User not found',
    })
    async getMyProfile(
        @CurrentUser() user: JwtPayload,
    ): Promise<ProfileResponseDto> {
        return this.profileService.getMyProfile(user);
    }

    @Patch('me')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Update my profile',
        description: 'Update profile information (excluding display name and contact info - use dedicated endpoints)',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Profile updated successfully',
        type: ProfileResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid input or trying to update restricted fields',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token',
    })
    async updateMyProfile(
        @Body() dto: UpdateProfileDto,
        @CurrentUser() user: JwtPayload,
    ): Promise<ProfileResponseDto> {
        return this.profileService.updateProfile(user, dto);
    }

    @Put('contact')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Update contact information',
        description: 'Update email and/or phone number with uniqueness validation',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Contact information updated successfully',
        type: ProfileResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid email or phone format',
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Email or phone already in use by another account',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token',
    })
    async updateContact(
        @Body() dto: UpdateContactDto,
        @CurrentUser() user: JwtPayload,
    ): Promise<ProfileResponseDto> {
        return this.profileService.updateContact(user, dto);
    }

    @Put('display-name')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Change display name',
        description: 'Change display name (restricted to once every 30 days)',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Display name changed successfully',
        type: DisplayNameChangeResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid display name format or same as current name',
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Cannot change display name yet - 30-day restriction not elapsed',
        schema: {
            example: {
                statusCode: 403,
                message: 'You can only change your display name once every 30 days. Please wait 15 more day(s).',
                error: 'Forbidden',
                code: 'DISPLAY_NAME_CHANGE_RESTRICTED',
                daysUntilCanChange: 15
            }
        }
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token',
    })
    async changeDisplayName(
        @Body() dto: ChangeDisplayNameDto,
        @CurrentUser() user: JwtPayload,
    ): Promise<DisplayNameChangeResponseDto> {
        return this.profileService.changeDisplayName(user, dto);
    }

    @Patch('avatar')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file', {
        limits: { fileSize: 2 * 1024 * 1024 },
    }))
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Update avatar',
        description: 'Update user avatar URL (must be a valid URL)',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Avatar updated successfully',
        type: ProfileResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid avatar URL format',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token',
    })
    async updateAvatar(
        @UploadedFile() file: Express.Multer.File,
        @CurrentUser() user: JwtPayload,
    ): Promise<ProfileResponseDto> {
        return this.profileService.updateAvatarFile(user, file);
    }

    @Delete('me')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Delete account',
        description: 'Soft delete the authenticated user\'s account (can be recovered within 30 days)',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Account deleted successfully',
        type: DeleteAccountResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized - Invalid or missing token',
    })
    @ApiResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        description: 'Failed to delete account',
    })
    async deleteAccount(
        @CurrentUser() user: JwtPayload,
    ): Promise<DeleteAccountResponseDto> {
        return this.profileService.deleteAccount(user);
    }


    @Get('user/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Get public profile',
        description: 'View public profile information of any user (limited data for privacy)',
    })
    @ApiParam({
        name: 'id',
        description: 'User UUID',
        example: 'uuid-123'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Public profile retrieved successfully',
        type: PublicProfileResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid UUID format',
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User not found or account inactive',
    })
    async getPublicProfile(
        @Param('id', ParseUUIDPipe) userId: string,
    ): Promise<PublicProfileResponseDto> {
        return this.profileService.getPublicProfile(userId);
    }

    @Get('search')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Search profiles',
        description: 'Search for users by display name (public endpoint for user discovery)',
    })
    @ApiQuery({
        name: 'searchTerm',
        required: false,
        description: 'Search term for display name',
        example: 'John'
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        description: 'Maximum number of results',
        example: 20
    })
    @ApiQuery({
        name: 'offset',
        required: false,
        description: 'Number of results to skip',
        example: 0
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Profiles found',
        type: ProfileListResponseDto,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid query parameters',
    })
    async searchProfiles(
        @Query() query: SearchProfilesQueryDto,
    ): Promise<ProfileListResponseDto> {
        const { searchTerm = '', limit = 20, offset = 0 } = query;

        const result = await this.profileService.searchProfiles(
            searchTerm,
            limit,
            offset,
        );

        return {
            profiles: result.profiles,
            total: result.total,
            count: result.profiles.length,
        };
    }
}