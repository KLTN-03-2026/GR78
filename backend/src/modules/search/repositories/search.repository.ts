import { UserRole } from '@/common/enums/user-role.enum';
import { PostCustomer } from '@/modules/posts/entities/post.entity';
import { PostStatus } from '@/modules/posts/enums/post-status.enum';
import { Profile } from '@/modules/profile/entities/profile.entity';
import { ProviderTrade } from '@/modules/profile/entities/providertrade.entity';
import { Trade } from '@/modules/profile/entities/trade.entity';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import {
    ByProvinceQueryDto,
    PostSearchQueryDto,
    PostSortBy,
    ProviderSearchQueryDto,
    ProviderSortBy,
    SortOrder,
    TradeSuggestQueryDto,
} from '../dtos/search.dto';


export type ProviderRow = Profile & {
    user: { id: string; isVerified: boolean; createdAt: Date;[key: string]: any };
    providerTrades: ProviderTrade[];
};

function escapeLikeParam(raw: string): string {
    return raw
        .replace(/\\/g, '\\\\') // 1. escape sentinel 
        .replace(/%/g, '\\%')   // 2. escape wildcard %
        .replace(/_/g, '\\_');  // 3. escape wildcard _
}

const ESCAPE_CLAUSE = "ESCAPE '\\\\'";



function escapeTradeNameCol(colSql: string): string {
    return `regexp_replace(${colSql}, '([%_\\\\])', '\\\\\\1', 'g')`;
}

// ─── Repository ───────────────────────────────────────────────────────────────

@Injectable()
export class SearchRepository {
    private readonly logger = new Logger(SearchRepository.name);

    constructor(
        @InjectRepository(PostCustomer)
        private readonly postRepo: Repository<PostCustomer>,
        @InjectRepository(Profile)
        private readonly profileRepo: Repository<Profile>,
        @InjectRepository(Trade)
        private readonly tradeRepo: Repository<Trade>,
    ) { }

   

    async searchPosts(
        dto: PostSearchQueryDto,
    ): Promise<{ rows: PostCustomer[]; total: number }> {
        const qb = this.buildPostBaseQuery();

        qb.andWhere('post.status = :status', {
            status: dto.status ?? PostStatus.OPEN,
        });

        if (dto.title?.trim()) {
            this.applyIlike(qb, 'post.title', dto.title.trim(), 'ptitle');
        }

        if (dto.province) {
            qb.andWhere('post.location ILIKE :pProvince', {
                pProvince: `%${dto.province}%`,
            });
        }

        

        if (dto.tradeSlugs?.length) {
            const escapedName = escapeTradeNameCol('_trFilter.name');

            qb.andWhere(
                `EXISTS (
                    SELECT 1
                    FROM   trades _trFilter
                    WHERE  _trFilter.slug      = ANY(:postTradeSlugs)
                      AND  _trFilter.is_active = true
                      AND  (
                               unaccent(post.title)
                                   ILIKE unaccent('%' || ${escapedName} || '%')
                                   ${ESCAPE_CLAUSE}
                            OR  post.title
                                   ILIKE '%' || ${escapedName} || '%'
                                   ${ESCAPE_CLAUSE}
                            OR  unaccent(post.description)
                                   ILIKE unaccent('%' || ${escapedName} || '%')
                                   ${ESCAPE_CLAUSE}
                            OR  post.description
                                   ILIKE '%' || ${escapedName} || '%'
                                   ${ESCAPE_CLAUSE}
                           )
                )`,
                { postTradeSlugs: dto.tradeSlugs },
            );
        }

        if (dto.budgetMin !== undefined) {
            qb.andWhere('post.budget >= :budgetMin', { budgetMin: dto.budgetMin });
        }
        if (dto.budgetMax !== undefined) {
            qb.andWhere('post.budget <= :budgetMax', { budgetMax: dto.budgetMax });
        }

        const sortMap: Record<PostSortBy, string> = {
            [PostSortBy.CREATED_AT]: 'post.createdAt',
            [PostSortBy.BUDGET]: 'post.budget',
            [PostSortBy.DESIRED_TIME]: 'post.desiredTime',
        };

        qb
            .orderBy(sortMap[dto.sortBy ?? PostSortBy.CREATED_AT], this.dir(dto.order))
            .take(dto.limit ?? 10)
            .skip(dto.offset ?? 0);

        const [rows, total] = await qb.getManyAndCount();
        return { rows, total };
    }

    
    async searchProviders(
        dto: ProviderSearchQueryDto,
    ): Promise<{ rows: ProviderRow[]; total: number }> {
        const qb = this.buildProviderBaseQuery();

        if (dto.displayName?.trim()) {
            this.applyIlike(
                qb as unknown as SelectQueryBuilder<any>,
                'profile.displayName',
                dto.displayName.trim(),
                'pname',
            );
        }

        if (dto.province) {
            qb.andWhere('profile.address ILIKE :pprovince', {
                pprovince: `%${dto.province}%`,
            });
        }

        if (dto.tradeSlugs?.length) {
            qb.andWhere(
                `EXISTS (
                    SELECT 1
                    FROM   provider_trades _ppt
                    INNER JOIN trades      _ttr ON _ttr.id = _ppt.trade_id
                    WHERE  _ppt.provider_id = user.id
                      AND  _ttr.slug        = ANY(:provTradeSlugs)
                      AND  _ttr.is_active   = true
                )`,
                { provTradeSlugs: dto.tradeSlugs },
            );
        }

        const sortMap: Record<ProviderSortBy, string> = {
            [ProviderSortBy.DISPLAY_NAME]: 'profile.displayName',
            [ProviderSortBy.CREATED_AT]: 'user.createdAt',
        };

        qb
            .orderBy(sortMap[dto.sortBy ?? ProviderSortBy.CREATED_AT], this.dir(dto.order))
            .take(dto.limit ?? 20)
            .skip(dto.offset ?? 0);

        const [rows, total] = await qb.getManyAndCount();
        return { rows: rows as ProviderRow[], total };
    }

    

    async searchByProvince(dto: ByProvinceQueryDto): Promise<{
        posts: PostCustomer[];
        totalPosts: number;
        providers: ProviderRow[];
        totalProviders: number;
    }> {
        const [postResult, providerResult] = await Promise.all([
            this.searchPosts({
                province: dto.province,
                limit: dto.postLimit ?? 10,
                offset: 0,
                status: PostStatus.OPEN,
            }),
            this.searchProviders({
                province: dto.province,
                limit: dto.providerLimit ?? 10,
                offset: 0,
            }),
        ]);

        return {
            posts: postResult.rows,
            totalPosts: postResult.total,
            providers: providerResult.rows,
            totalProviders: providerResult.total,
        };
    }

    
    async globalSearchPosts(
        keyword: string,
        province?: string,
        limit = 5,
    ): Promise<{ rows: PostCustomer[]; total: number }> {
        return this.searchPosts({
            title: keyword,
            province: province as any,
            limit,
            offset: 0,
            status: PostStatus.OPEN,
        });
    }

    async globalSearchProviders(
        keyword: string,
        province?: string,
        limit = 5,
    ): Promise<{ rows: ProviderRow[]; total: number }> {
        const qb = this.buildProviderBaseQuery();

        if (province) {
            qb.andWhere('profile.address ILIKE :gprovince', {
                gprovince: `%${province}%`,
            });
        }

       

        const safeKw = escapeLikeParam(keyword);
        const escapedGtName = escapeTradeNameCol('_gt.name');

        qb.andWhere(
            new Brackets((ob) => {
                ob
                    .where(
                        `unaccent(COALESCE(profile.displayName, '')) ILIKE unaccent(:glike) ${ESCAPE_CLAUSE}`,
                        { glike: `%${safeKw}%` },
                    )
                    .orWhere(
                        `COALESCE(profile.displayName, '') ILIKE :graw ${ESCAPE_CLAUSE}`,
                        { graw: `%${safeKw}%` },
                    )
                    .orWhere(
                        `EXISTS (
                            SELECT 1
                            FROM   provider_trades _gpt
                            INNER JOIN trades      _gt ON _gt.id = _gpt.trade_id
                            WHERE  _gpt.provider_id = user.id
                              AND  _gt.is_active     = true
                              AND  (
                                       unaccent(${escapedGtName})
                                           ILIKE unaccent(:gtLike) ${ESCAPE_CLAUSE}
                                    OR  ${escapedGtName}
                                           ILIKE :gtRaw ${ESCAPE_CLAUSE}
                                   )
                        )`,
                        { gtLike: `%${keyword}%`, gtRaw: `%${keyword}%` },
                    );
            }),
        );

        qb.orderBy('user.createdAt', 'DESC').take(limit).skip(0);

        const [rows, total] = await qb.getManyAndCount();
        return { rows: rows as ProviderRow[], total };
    }

 

    async findTrades(dto: TradeSuggestQueryDto): Promise<Trade[]> {
        const qb = this.tradeRepo
            .createQueryBuilder('trade')
            .where('trade.isActive = true');

        if (dto.category) {
            qb.andWhere('trade.category = :tcat', { tcat: dto.category });
        }

        if (dto.q?.trim()) {
            this.applyIlike(
                qb as unknown as SelectQueryBuilder<any>,
                'trade.name',
                dto.q.trim(),
                'tname',
            );
        }

        return qb
            .orderBy('trade.sortOrder', 'ASC')
            .addOrderBy('trade.name', 'ASC')
            .getMany();
    }

    async findDistinctTradeCategories(): Promise<string[]> {
        const rows = await this.tradeRepo
            .createQueryBuilder('trade')
            .select('DISTINCT trade.category', 'category')
            .where('trade.isActive = true')
            .andWhere('trade.category IS NOT NULL')
            .orderBy('trade.category', 'ASC')
            .getRawMany<{ category: string }>();

        return rows.map((r) => r.category).filter(Boolean);
    }


    private buildPostBaseQuery() {
        return this.postRepo
            .createQueryBuilder('post')
            .leftJoinAndSelect('post.customer', 'customer')
            .leftJoinAndSelect('customer.profile', 'profile')
            .where('post.deletedAt IS NULL');
    }

    private buildProviderBaseQuery() {
        return this.profileRepo
            .createQueryBuilder('profile')
            .innerJoinAndSelect('profile.user', 'user')
            .leftJoinAndSelect('user.providerTrades', 'providerTrade')
            .leftJoinAndSelect('providerTrade.trade', 'trade', 'trade.isActive = true')
            .where('user.isActive = true')
            .andWhere('user.role = :urole', { urole: UserRole.PROVIDER });
    }

    
    private applyIlike(
        qb: SelectQueryBuilder<any>,
        column: string,
        keyword: string,
        prefix: string,
    ): void {
        const pUnaccent = `${prefix}_u`;
        const pRaw = `${prefix}_r`;
        const safe = escapeLikeParam(keyword);

        qb.andWhere(
            new Brackets((b) => {
                b
                    .where(
                        `unaccent(COALESCE(${column}, '')) ILIKE unaccent(:${pUnaccent}) ${ESCAPE_CLAUSE}`,
                        { [pUnaccent]: `%${safe}%` },
                    )
                    .orWhere(
                        `COALESCE(${column}, '') ILIKE :${pRaw} ${ESCAPE_CLAUSE}`,
                        { [pRaw]: `%${safe}%` },
                    );
            }),
        );
    }

    private dir(order?: SortOrder): 'ASC' | 'DESC' {
        return (order ?? SortOrder.DESC).toUpperCase() as 'ASC' | 'DESC';
    }
}