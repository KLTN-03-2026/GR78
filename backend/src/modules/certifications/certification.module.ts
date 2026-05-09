import { Profile } from '@/modules/profile/entities/profile.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificationController } from './controllers/certification.controller';
import { Certification } from './entities/certification.entity';
import { CertificationRepository } from './repositories/certification.repository';
import { CertificationService } from './services/certification.service';

@Module({
    imports: [TypeOrmModule.forFeature([Certification, Profile])],
    controllers: [CertificationController],
    providers: [CertificationService, CertificationRepository],
    exports: [CertificationService, CertificationRepository],
})
export class CertificationModule {}
