import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@/modules/users/entities/user.entity';
import { Profile } from './entities/profile.entity';

import { ProfileController } from './controllers/profile.controller';
import { ProfileRepository } from './repositorys/profile-repository';
import { ProfileDomainService } from './services/profile-domain.service';
import { ProfileResponseBuilder } from './services/profile-response-builder.service';
import { ProfileService } from './services/profile.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Profile, User]),
        ConfigModule,
    ],
    controllers: [ProfileController],
    providers: [
        ProfileService,

        ProfileDomainService,

        ProfileResponseBuilder,

        ProfileRepository,
    ],
    exports: [
        ProfileService,
        ProfileDomainService,
        ProfileResponseBuilder,
        ProfileRepository,
    ],
})
export class ProfileModule { }