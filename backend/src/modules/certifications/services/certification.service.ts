import { UploadService } from '@/common/upload/upload.service';
import { Profile } from '@/modules/profile/entities/profile.entity';
import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
    CertificationListResponseDto,
    CertificationResponseDto,
    PublicCertificationDto,
    PublicCertificationListResponseDto,
    UploadCertificationDto,
} from '../dtos/certification.dto';
import { Certification } from '../entities/certification.entity';
import { CertificationStatus } from '../enums/certification-status.enum';
import { CertificationRepository } from '../repositories/certification.repository';

const MAX_CERTIFICATIONS_PER_USER = 10;

@Injectable()
export class CertificationService {
    private readonly logger = new Logger(CertificationService.name);

    constructor(
        private readonly certRepo: CertificationRepository,
        private readonly uploadService: UploadService,
        private readonly dataSource: DataSource,
        @InjectRepository(Profile)
        private readonly profileRepo: Repository<Profile>,
    ) {}

    async uploadCertification(
        userId: string,
        dto: UploadCertificationDto,
        file: Express.Multer.File,
    ): Promise<CertificationResponseDto> {
        if (!file) {
            throw new BadRequestException('Certification PDF file is required');
        }

        const existingCount = await this.certRepo.countByUserId(userId);
        if (existingCount >= MAX_CERTIFICATIONS_PER_USER) {
            throw new BadRequestException(
                `Maximum of ${MAX_CERTIFICATIONS_PER_USER} certifications allowed per provider`,
            );
        }

        const qr = this.dataSource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
            const uploaded = await this.uploadService.uploadDocument(file, 'certifications');

            const cert = await this.certRepo.create(
                {
                    userId,
                    title: dto.title.trim(),
                    issuingOrganization: dto.issuingOrganization?.trim(),
                    issueDate: dto.issueDate ? new Date(dto.issueDate) : undefined,
                    expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
                    fileUrl: uploaded.publicUrl,
                    fileName: uploaded.fileName,
                    originalName: file.originalname,
                    fileSize: file.size,
                    verificationStatus: CertificationStatus.PENDING,
                },
                qr.manager,
            );

            await qr.manager
                .createQueryBuilder()
                .update(Profile)
                .set({ certificationCount: () => 'certification_count + 1' })
                .where('user_id = :userId', { userId })
                .execute();

            await qr.commitTransaction();

            this.logger.log(`Certification uploaded: ${cert.id} for user ${userId}`);
            return this.toResponseDto(cert);
        } catch (error) {
            await qr.rollbackTransaction();

            this.logger.error(`Failed to upload certification for user: ${userId}`, error);
            if (
                error instanceof BadRequestException ||
                error instanceof InternalServerErrorException
            ) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to save certification');
        } finally {
            await qr.release();
        }
    }

    async getMyCertifications(userId: string): Promise<CertificationListResponseDto> {
        try {
            const data = await this.certRepo.findByUserId(userId);
            return {
                data: data.map((c) => this.toResponseDto(c)),
                total: data.length,
            };
        } catch (error) {
            this.logger.error(`Failed to fetch certifications for user: ${userId}`, error);
            throw new InternalServerErrorException('Failed to fetch certifications');
        }
    }

    async getProviderPublicCertifications(
        providerId: string,
    ): Promise<PublicCertificationListResponseDto> {
        try {
            const data = await this.certRepo.findVerifiedByUserId(providerId);
            return {
                data: data.map((c) => this.toPublicDto(c)),
                total: data.length,
            };
        } catch (error) {
            this.logger.error(
                `Failed to fetch public certifications for provider: ${providerId}`,
                error,
            );
            throw new InternalServerErrorException('Failed to fetch certifications');
        }
    }

    async deleteCertification(
        userId: string,
        certId: string,
    ): Promise<{ success: boolean; message: string }> {
        const cert = await this.certRepo.findByIdAndUserId(certId, userId);

        if (!cert) {
            throw new NotFoundException('Certification not found or does not belong to you');
        }

        const qr = this.dataSource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
            await this.uploadService.deleteDocument(cert.fileName);
            await this.certRepo.delete(certId, qr.manager);

            await qr.manager
                .createQueryBuilder()
                .update(Profile)
                .set({
                    certificationCount: () =>
                        'GREATEST(certification_count - 1, 0)',
                })
                .where('user_id = :userId', { userId })
                .execute();

            await qr.commitTransaction();

            this.logger.log(`Certification deleted: ${certId} by user ${userId}`);
            return { success: true, message: 'Certification deleted successfully' };
        } catch (error) {
            await qr.rollbackTransaction();

            this.logger.error(`Failed to delete certification ${certId} for user: ${userId}`, error);
            if (error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException('Failed to delete certification');
        } finally {
            await qr.release();
        }
    }

    private toResponseDto(cert: Certification): CertificationResponseDto {
        return {
            id: cert.id,
            userId: cert.userId,
            title: cert.title,
            issuingOrganization: cert.issuingOrganization,
            issueDate: cert.issueDate,
            expiryDate: cert.expiryDate,
            fileUrl: cert.fileUrl,
            originalName: cert.originalName,
            fileSize: cert.fileSize,
            verificationStatus: cert.verificationStatus,
            rejectionReason: cert.rejectionReason,
            isExpired: cert.isExpired(),
            createdAt: cert.createdAt,
            updatedAt: cert.updatedAt,
        };
    }

    private toPublicDto(cert: Certification): PublicCertificationDto {
        return {
            id: cert.id,
            title: cert.title,
            issuingOrganization: cert.issuingOrganization,
            issueDate: cert.issueDate,
            expiryDate: cert.expiryDate,
            fileUrl: cert.fileUrl,
            isExpired: cert.isExpired(),
            createdAt: cert.createdAt,
        };
    }
}
