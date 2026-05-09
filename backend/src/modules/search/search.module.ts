import { PostCustomer } from '@/modules/posts/entities/post.entity';
import { Profile } from '@/modules/profile/entities/profile.entity';
import { ProviderTrade } from '@/modules/profile/entities/provider-trade.entity';
import { Trade } from '@/modules/profile/entities/trade.entity';
import { RedisModule } from '@/modules/redis/redis.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { SearchRepository } from './repositories/search.repository';
import { SearchCacheService } from './services/search-cache.service';
import { SearchMapperService } from './services/search-mapper.service';
import { SearchService } from './services/search.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([PostCustomer, Profile, Trade, ProviderTrade]),
        RedisModule,
    ],
    controllers: [SearchController],
    providers: [SearchService, SearchRepository, SearchMapperService, SearchCacheService],
    exports: [SearchService, SearchCacheService],
})
export class SearchModule {}
