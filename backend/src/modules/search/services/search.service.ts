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
import { SearchMapperService } from './search mapper.service';

@Injectable()
export class SearchService {
    private readonly logger = new Logger(SearchService.name);

    constructor(
        private readonly repo: SearchRepository,
        private readonly mapper: SearchMapperService,
    ) { }


    async globalSearch(dto: GlobalSearchQueryDto): Promise<GlobalSearchResponseDto> {
        const t0 = Date.now();
        const { q, type = SearchType.ALL, province, limit = 5 } = dto;

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

        return {
            query: q,
            posts: doPost ? postRes.rows.map((p) => this.mapper.toPostResult(p, q)) : undefined,
            providers: doProvider ? provRes.rows.map((p) => this.mapper.toProviderResult(p)) : undefined,
            totalPosts: postRes.total,
            totalProviders: provRes.total,
            took: Date.now() - t0,
        };
    }


    async searchPosts(dto: PostSearchQueryDto): Promise<PostSearchResponseDto> {
        const t0 = Date.now();
        const limit = dto.limit ?? 10;
        const offset = dto.offset ?? 0;

        this.logger.log(
            `[posts] title="${dto.title ?? ''}" province="${dto.province ?? ''}" ` +
            `trades=[${(dto.tradeSlugs ?? []).join(',')}] ` +
            `budget=[${dto.budgetMin ?? '*'},${dto.budgetMax ?? '*'}]`,
        );

        const { rows, total } = await this.repo.searchPosts(dto);

        return {
            data: rows.map((p) => this.mapper.toPostResult(p, dto.title)),
            total,
            limit,
            offset,
            hasMore: offset + rows.length < total,
            took: Date.now() - t0,
        };
    }


    async searchProviders(dto: ProviderSearchQueryDto): Promise<ProviderSearchResponseDto> {
        const t0 = Date.now();
        const limit = dto.limit ?? 20;
        const offset = dto.offset ?? 0;

        this.logger.log(
            `[providers] name="${dto.displayName ?? ''}" ` +
            `province="${dto.province ?? ''}" ` +
            `trades=[${(dto.tradeSlugs ?? []).join(',')}]`,
        );

        const { rows, total } = await this.repo.searchProviders(dto);

        return {
            data: rows.map((p) => this.mapper.toProviderResult(p)),
            total,
            limit,
            offset,
            hasMore: offset + rows.length < total,
            took: Date.now() - t0,
        };
    }


    async searchByProvince(dto: ByProvinceQueryDto): Promise<ByProvinceResponseDto> {
        const t0 = Date.now();

        this.logger.log(`[by-province] province="${dto.province}"`);

        const { posts, totalPosts, providers, totalProviders } =
            await this.repo.searchByProvince(dto);

        return {
            province: dto.province,
            posts: posts.map((p) => this.mapper.toPostResult(p)),
            totalPosts,
            providers: providers.map((p) => this.mapper.toProviderResult(p)),
            totalProviders,
            took: Date.now() - t0,
        };
    }


    suggestProvinces(q?: string): ProvinceSuggestResponseDto {
        if (!q?.trim()) return { provinces: [...VIETNAM_PROVINCES] };

        const kw = q.trim().toLowerCase();
        return {
            provinces: VIETNAM_PROVINCES.filter((p) =>
                p.toLowerCase().includes(kw),
            ),
        };
    }


    async suggestTrades(dto: TradeSuggestQueryDto): Promise<TradeSuggestResponseDto> {
        const [trades, categories] = await Promise.all([
            this.repo.findTrades(dto),
            this.repo.findDistinctTradeCategories(),
        ]);

        return {
            trades: trades.map((t) => this.mapper.toTradeDto(t)),
            categories,
        };
    }
}