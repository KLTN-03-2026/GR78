import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
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
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiBearerAuth,
    ApiConsumes,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import {
    CertificationListResponseDto,
    CertificationResponseDto,
    PublicCertificationListResponseDto,
    UploadCertificationDto,
} from '../dtos/certification.dto';
import { CertificationService } from '../services/certification.service';

@ApiTags('Certifications')
@Controller('certifications')
export class CertificationController {
    constructor(private readonly certService: CertificationService) {}

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PROVIDER)
    @UseInterceptors(
        FileInterceptor('file', {
            limits: { fileSize: 10 * 1024 * 1024 },
        }),
    )
    @HttpCode(HttpStatus.CREATED)
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @ApiOperation({
        summary: 'Upload a certification PDF',
        description:
            'Upload a professional certification PDF (max 10 MB). ' +
            'The certificate is created with status **pending** until an admin verifies it. ' +
            'Only providers may call this endpoint. Max 10 certifications per provider.',
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Certification uploaded successfully — awaiting admin review',
        type: CertificationResponseDto,
    })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Missing file or invalid fields' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Not authenticated' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Provider role required' })
    async uploadCertification(
        @CurrentUser() user: JwtPayload,
        @UploadedFile() file: Express.Multer.File,
        @Body() dto: UploadCertificationDto,
    ): Promise<CertificationResponseDto> {
        return this.certService.uploadCertification(user.id, dto, file);
    }

    @Get('my')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PROVIDER)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'List my certifications',
        description: 'Returns all certifications (any status) for the authenticated provider.',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: CertificationListResponseDto,
    })
    async getMyCertifications(
        @CurrentUser() user: JwtPayload,
    ): Promise<CertificationListResponseDto> {
        return this.certService.getMyCertifications(user.id);
    }

    @Get('provider/:providerId')
    @HttpCode(HttpStatus.OK)
    @ApiParam({ name: 'providerId', description: 'Provider UUID' })
    @ApiOperation({
        summary: "Get a provider's verified certifications",
        description:
            'Public endpoint. Returns only **verified** certifications. ' +
            'Use this to display the green checkmark detail view on a provider profile.',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        type: PublicCertificationListResponseDto,
    })
    async getProviderCertifications(
        @Param('providerId', ParseUUIDPipe) providerId: string,
    ): Promise<PublicCertificationListResponseDto> {
        return this.certService.getProviderPublicCertifications(providerId);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.PROVIDER)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    @ApiParam({ name: 'id', description: 'Certification UUID' })
    @ApiOperation({
        summary: 'Delete a certification',
        description:
            'Permanently deletes the certification record and its PDF from storage. ' +
            'Providers may only delete their own certifications.',
    })
    @ApiResponse({ status: HttpStatus.OK, description: 'Certification deleted successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Certification not found' })
    async deleteCertification(
        @CurrentUser() user: JwtPayload,
        @Param('id', ParseUUIDPipe) certId: string,
    ): Promise<{ success: boolean; message: string }> {
        return this.certService.deleteCertification(user.id, certId);
    }
}
