import { PostCustomer } from '@/modules/posts/entities/post.entity';
import { Profile } from '@/modules/profile/entities/profile.entity';
import { ProviderTrade } from '@/modules/profile/entities/providertrade.entity';
import { Trade } from '@/modules/profile/entities/trade.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { SearchRepository } from './repositories/search.repository';
import { SearchMapperService } from './services/search mapper.service';
import { SearchService } from './services/search.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([PostCustomer, Profile, Trade, ProviderTrade]),
    ],
    controllers: [SearchController],
    providers: [SearchService, SearchRepository, SearchMapperService],
    exports: [SearchService],
})
export class SearchModule {}