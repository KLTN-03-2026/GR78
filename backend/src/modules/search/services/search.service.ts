import { Injectable, Logger } from '@nestjs/common';
import {
    ByProvinceQueryDto,
    ByProvinceResponseDto,
    GlobalSearchQueryDto,
    GlobalSearchResponseDto,
    PostSearchQueryDto,
    PostSearchResponseDto,
    ProviderSearchQueryDto,
    ProviderSearchResponseDto,
    ProvinceSuggestResponseDto,
    SearchType,
    TradeSuggestQueryDto,
    TradeSuggestResponseDto,
    VIETNAM_PROVINCES,
} from '../dtos/search.dto';
import { SearchRepository } from '../repositories/search.repository';
import { SearchCacheService } from './search-cache.service';
import { SearchMapperService } from './search-mapper.service';

@Injectable()
export class SearchService {
    private readonly logger = new Logger(SearchService.name);

    constructor(
        private readonly repo: SearchRepository,
        private readonly mapper: SearchMapperService,
        private readonly cache: SearchCacheService,
    ) {}


    async globalSearch(dto: GlobalSearchQueryDto): Promise<GlobalSearchResponseDto> {
        const t0 = Date.now();
        const { q, type = SearchType.ALL, province, limit = 5 } = dto;

        const cacheKey = this.cache.keyGlobal(dto);
        const hit = await this.cache.get<GlobalSearchResponseDto>(cacheKey);
        if (hit) {
            this.logger.debug(`[global] cache hit q="${q}"`);
            return { ...hit, took: Date.now() - t0 };
        }

        this.logger.log(`[global] q="${q}" type=${type} province=${province ?? '-'}`);

        const doPost = type === SearchType.ALL || type === SearchType.POST;
        const doProvider = type === SearchType.ALL || type === SearchType.PROVIDER;

        const [postRes, provRes] = await Promise.all([
            doPost
                ? this.repo.globalSearchPosts(q, province, limit)
                : Promise.resolve({ rows: [], total: 0 }),
            doProvider
                ? this.repo.globalSearchProviders(q, province, limit)
                : Promise.resolve({ rows: [], total: 0 }),
        ]);

        const result: GlobalSearchResponseDto = {
            query: q,
            posts: doPost ? postRes.rows.map((p) => this.mapper.toPostResult(p, q)) : undefined,
            providers: doProvider
                ? provRes.rows.map((p) => this.mapper.toProviderResult(p))
                : undefined,
            totalPosts: postRes.total,
            totalProviders: provRes.total,
            took: Date.now() - t0,
        };

        await this.cache.set(cacheKey, result, this.cache.ttl.GLOBAL);
        return result;
    }


    async searchPosts(dto: PostSearchQueryDto): Promise<PostSearchResponseDto> {
        const t0 = Date.now();
        const limit = dto.limit ?? 10;
        const offset = dto.offset ?? 0;

        const cacheKey = this.cache.keyPosts(dto);
        const hit = await this.cache.get<PostSearchResponseDto>(cacheKey);
        if (hit) {
            this.logger.debug(`[posts] cache hit title="${dto.title ?? ''}"`);
            return { ...hit, took: Date.now() - t0 };
        }

        this.logger.log(
            `[posts] title="${dto.title ?? ''}" province="${dto.province ?? ''}" ` +
                `trades=[${(dto.tradeSlugs ?? []).join(',')}] ` +
                `budget=[${dto.budgetMin ?? '*'},${dto.budgetMax ?? '*'}]`,
        );

        const { rows, total } = await this.repo.searchPosts(dto);

        const result: PostSearchResponseDto = {
            data: rows.map((p) => this.mapper.toPostResult(p, dto.title)),
            total,
            limit,
            offset,
            hasMore: offset + rows.length < total,
            took: Date.now() - t0,
        };

        await this.cache.set(cacheKey, result, this.cache.ttl.POSTS);
        return result;
    }


    async searchProviders(dto: ProviderSearchQueryDto): Promise<ProviderSearchResponseDto> {
        const t0 = Date.now();
        const limit = dto.limit ?? 20;
        const offset = dto.offset ?? 0;

        const cacheKey = this.cache.keyProviders(dto);
        const hit = await this.cache.get<ProviderSearchResponseDto>(cacheKey);
        if (hit) {
            this.logger.debug(`[providers] cache hit name="${dto.displayName ?? ''}"`);
            return { ...hit, took: Date.now() - t0 };
        }

        this.logger.log(
            `[providers] name="${dto.displayName ?? ''}" ` +
                `province="${dto.province ?? ''}" ` +
                `trades=[${(dto.tradeSlugs ?? []).join(',')}]`,
        );

        const { rows, total } = await this.repo.searchProviders(dto);

        const result: ProviderSearchResponseDto = {
            data: rows.map((p) => this.mapper.toProviderResult(p)),
            total,
            limit,
            offset,
            hasMore: offset + rows.length < total,
            took: Date.now() - t0,
        };

        await this.cache.set(cacheKey, result, this.cache.ttl.PROVIDERS);
        return result;
    }


    async searchByProvince(dto: ByProvinceQueryDto): Promise<ByProvinceResponseDto> {
        const t0 = Date.now();

        const cacheKey = this.cache.keyProvince(dto);
        const hit = await this.cache.get<ByProvinceResponseDto>(cacheKey);
        if (hit) {
            this.logger.debug(`[by-province] cache hit province="${dto.province}"`);
            return { ...hit, took: Date.now() - t0 };
        }

        this.logger.log(`[by-province] province="${dto.province}"`);

        const { posts, totalPosts, providers, totalProviders } =
            await this.repo.searchByProvince(dto);

        const result: ByProvinceResponseDto = {
            province: dto.province,
            posts: posts.map((p) => this.mapper.toPostResult(p)),
            totalPosts,
            providers: providers.map((p) => this.mapper.toProviderResult(p)),
            totalProviders,
            took: Date.now() - t0,
        };

        await this.cache.set(cacheKey, result, this.cache.ttl.PROVINCE);
        return result;
    }


    suggestProvinces(q?: string): ProvinceSuggestResponseDto {
        if (!q?.trim()) return { provinces: [...VIETNAM_PROVINCES] };

        const kw = q.trim().toLowerCase();
        return {
            provinces: VIETNAM_PROVINCES.filter((p) => p.toLowerCase().includes(kw)),
        };
    }


    async suggestTrades(dto: TradeSuggestQueryDto): Promise<TradeSuggestResponseDto> {
        const cacheKey = this.cache.keyTrades(dto);
        const hit = await this.cache.get<TradeSuggestResponseDto>(cacheKey);
        if (hit) {
            this.logger.debug(`[trades] cache hit q="${dto.q ?? ''}"`);
            return hit;
        }

        const [trades, categories] = await Promise.all([
            this.repo.findTrades(dto),
            this.repo.findDistinctTradeCategories(),
        ]);

        const result: TradeSuggestResponseDto = {
            trades: trades.map((t) => this.mapper.toTradeDto(t)),
            categories,
        };

        await this.cache.set(cacheKey, result, this.cache.ttl.TRADES);
        return result;
    }
}
