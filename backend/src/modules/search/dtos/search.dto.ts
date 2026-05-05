import { PostStatus } from '@/modules/posts/enums/post-status.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
    IsArray,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    Min,
    MinLength,
} from 'class-validator';


export const VIETNAM_PROVINCES = [
    'Hà Nội', 'TP. Hồ Chí Minh', 'Hải Phòng', 'Cần Thơ', 'Đà Nẵng',
    'Huế', 'Cao Bằng', 'Điện Biên', 'Lai Châu', 'Sơn La', 'Lạng Sơn',
    'Quảng Ninh', 'Thanh Hóa', 'Nghệ An', 'Hà Tĩnh', 'Tuyên Quang',
    'Lào Cai', 'Thái Nguyên', 'Phú Thọ', 'Bắc Ninh', 'Hưng Yên',
    'Ninh Bình', 'Quảng Trị', 'Quảng Ngãi', 'Gia Lai', 'Đắk Lắk',
    'Khánh Hòa', 'Lâm Đồng', 'Tây Ninh', 'Đồng Tháp', 'An Giang',
    'Vĩnh Long', 'Cà Mau',
] as const;

export type VietnamProvince = (typeof VIETNAM_PROVINCES)[number];


export enum SearchType {
    ALL = 'all',
    POST = 'post',
    PROVIDER = 'provider',
}

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

export enum PostSortBy {
    CREATED_AT = 'createdAt',
    BUDGET = 'budget',
    DESIRED_TIME = 'desiredTime',
}

export enum ProviderSortBy {
    DISPLAY_NAME = 'displayName',
    CREATED_AT = 'createdAt',
}


const slugArrayTransform = ({ value }: { value: unknown }): string[] | undefined => {
    if (!value) return undefined;
    const arr = Array.isArray(value) ? (value as string[]) : [value as string];
    return arr
        .flatMap((v) => v.split(','))
        .map((s) => s.trim())
        .filter(Boolean);
};


export class TradeDto {
    @ApiProperty({ example: 'uuid-trade-1' })
    id!: string;

    @ApiProperty({ example: 'Thợ điện' })
    name!: string;

    @ApiProperty({ example: 'tho-dien' })
    slug!: string;

    @ApiPropertyOptional({ example: 'Điện - Nước' })
    category?: string;

    @ApiPropertyOptional({ example: '⚡' })
    icon?: string;

    @ApiPropertyOptional({ example: 5 })
    yearsExperience?: number;
}


export class GlobalSearchQueryDto {
    @ApiProperty({
        description: 'Từ khoá (1 ký tự trở lên). VD: "đ" → tất cả bài/thợ liên quan',
        example: 'điện',
        minLength: 1,
    })
    @IsString()
    @MinLength(1)
    q!: string;

    @ApiPropertyOptional({
        description: 'Phạm vi: all | post | provider',
        enum: SearchType,
        default: SearchType.ALL,
    })
    @IsEnum(SearchType)
    @IsOptional()
    type?: SearchType = SearchType.ALL;

    @ApiPropertyOptional({
        description: 'Lọc theo tỉnh/thành (34 tỉnh)',
        enum: VIETNAM_PROVINCES,
        example: 'Đà Nẵng',
    })
    @IsString()
    @IsOptional()
    province?: VietnamProvince;

    @ApiPropertyOptional({ description: 'Số kết quả mỗi loại', example: 5, default: 5 })
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(20)
    @IsOptional()
    limit?: number = 5;
}

export class GlobalSearchResponseDto {
    @ApiProperty({ example: 'điện' })
    query!: string;

    @ApiPropertyOptional({ type: () => PostSearchResultDto, isArray: true })
    posts?: PostSearchResultDto[];

    @ApiPropertyOptional({ type: () => ProviderSearchResultDto, isArray: true })
    providers?: ProviderSearchResultDto[];

    @ApiProperty({ example: 42 })
    totalPosts!: number;

    @ApiProperty({ example: 8 })
    totalProviders!: number;

    @ApiProperty({ description: 'Thời gian xử lý (ms)', example: 18 })
    took!: number;
}



export class PostSearchQueryDto {
    @ApiPropertyOptional({
        description:
            'Tìm theo tiêu đề bài đăng (1 ký tự trở lên). ' +
            'Hỗ trợ không dấu: "sua dien" → "sửa điện".',
        example: 'sửa điện',
    })
    @IsString()
    @MinLength(1)
    @IsOptional()
    title?: string;

    @ApiPropertyOptional({
        description: 'Lọc cứng theo tỉnh/thành — chọn từ 34 tỉnh',
        enum: VIETNAM_PROVINCES,
        example: 'Đà Nẵng',
    })
    @IsString()
    @IsOptional()
    province?: VietnamProvince;

    @ApiPropertyOptional({
        description:
            'Lọc bài đăng theo ngành nghề liên quan. ' +
            'Tìm trong title + description của bài. ' +
            'VD: ?tradeSlugs=tho-dien → các bài đăng cần thợ điện. ' +
            'Nhiều nghề dùng repeat param hoặc phân cách phẩy.',
        type: [String],
        example: ['tho-dien'],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(slugArrayTransform)
    tradeSlugs?: string[];

    @ApiPropertyOptional({ enum: PostStatus, default: PostStatus.OPEN })
    @IsEnum(PostStatus)
    @IsOptional()
    status?: PostStatus;

    @ApiPropertyOptional({ description: 'Ngân sách tối thiểu (VND)', example: 100000 })
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @IsOptional()
    budgetMin?: number;

    @ApiPropertyOptional({ description: 'Ngân sách tối đa (VND)', example: 5000000 })
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @IsOptional()
    budgetMax?: number;

    @ApiPropertyOptional({ enum: PostSortBy, default: PostSortBy.CREATED_AT })
    @IsEnum(PostSortBy)
    @IsOptional()
    sortBy?: PostSortBy = PostSortBy.CREATED_AT;

    @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC })
    @IsEnum(SortOrder)
    @IsOptional()
    order?: SortOrder = SortOrder.DESC;

    @ApiPropertyOptional({ example: 10, default: 10 })
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(50)
    @IsOptional()
    limit?: number = 10;

    @ApiPropertyOptional({ example: 0, default: 0 })
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @IsOptional()
    offset?: number = 0;
}

export class PostSearchResultDto {
    @ApiProperty({ example: 'uuid-123' })
    id!: string;

    @ApiProperty({ example: 'Cần thợ sửa điện nước tại nhà' })
    title!: string;

    @ApiPropertyOptional({ example: 'Quận Hải Châu, Đà Nẵng' })
    location?: string;

    @ApiPropertyOptional({ example: 'Đà Nẵng' })
    province?: string;

    @ApiProperty({ enum: PostStatus })
    status!: PostStatus;

    @ApiPropertyOptional({ example: 500000 })
    budget?: number;

    @ApiPropertyOptional({ example: '2025-11-20T10:00:00Z' })
    desiredTime?: Date;

    @ApiProperty({
        type: 'object',
        properties: {
            customerId: { type: 'string' },
            displayName: { type: 'string', nullable: true },
            avatarUrl: { type: 'string', nullable: true },
        },
    })
    customer!: {
        customerId: string;
        displayName: string | null;
        avatarUrl: string | null;
    };

    @ApiProperty({ example: '2025-11-13T10:00:00Z' })
    createdAt!: Date;

    @ApiPropertyOptional({
        description: 'Tiêu đề với từ khoá bọc <em>...</em> để FE highlight',
        example: 'Cần thợ <em>sửa điện</em> nước tại nhà',
    })
    highlight?: string;
}

export class PostSearchResponseDto {
    @ApiProperty({ type: [PostSearchResultDto] })
    data!: PostSearchResultDto[];

    @ApiProperty({ example: 42 })
    total!: number;

    @ApiProperty({ example: 10 })
    limit!: number;

    @ApiProperty({ example: 0 })
    offset!: number;

    @ApiProperty({ example: true })
    hasMore!: boolean;

    @ApiProperty({ description: 'Thời gian xử lý (ms)', example: 12 })
    took!: number;
}



export class ProviderSearchQueryDto {
    @ApiPropertyOptional({
        description:
            'Tìm theo tên thợ (1 ký tự trở lên). ' +
            'Hỗ trợ không dấu: "M" → tất cả thợ có tên chứa "M" hoặc "m".',
        example: 'Minh',
    })
    @IsString()
    @MinLength(1)
    @IsOptional()
    displayName?: string;

    @ApiPropertyOptional({
        description: 'Lọc cứng theo tỉnh/thành — chọn từ 34 tỉnh',
        enum: VIETNAM_PROVINCES,
        example: 'Hà Nội',
    })
    @IsString()
    @IsOptional()
    province?: VietnamProvince;

    @ApiPropertyOptional({
        description:
            'Lọc cứng theo slug nghề đã đăng ký (OR logic). ' +
            'Chỉ trả về thợ có ÍT NHẤT 1 nghề khớp. ' +
            'VD: ?tradeSlugs=tho-dien&tradeSlugs=tho-nuoc',
        type: [String],
        example: ['tho-dien'],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(slugArrayTransform)
    tradeSlugs?: string[];

    @ApiPropertyOptional({ enum: ProviderSortBy, default: ProviderSortBy.CREATED_AT })
    @IsEnum(ProviderSortBy)
    @IsOptional()
    sortBy?: ProviderSortBy = ProviderSortBy.CREATED_AT;

    @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC })
    @IsEnum(SortOrder)
    @IsOptional()
    order?: SortOrder = SortOrder.DESC;

    @ApiPropertyOptional({ example: 20, default: 20 })
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(50)
    @IsOptional()
    limit?: number = 20;

    @ApiPropertyOptional({ example: 0, default: 0 })
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @IsOptional()
    offset?: number = 0;
}

export class ProviderSearchResultDto {
    @ApiProperty({ example: 'uuid-456' })
    id!: string;

    @ApiPropertyOptional({ example: 'Thợ Điện Minh' })
    displayName?: string;

    @ApiPropertyOptional({ example: 'https://cdn.example.com/avatar.jpg' })
    avatarUrl?: string;

    @ApiPropertyOptional({ example: 'Thợ điện 10 năm kinh nghiệm...' })
    bio?: string;

    @ApiPropertyOptional({ example: 'Quận 1, TP. Hồ Chí Minh' })
    address?: string;

    @ApiPropertyOptional({ example: 'TP. Hồ Chí Minh' })
    province?: string;

    @ApiProperty({ type: [TradeDto], description: 'Nghề của thợ kèm số năm kinh nghiệm' })
    trades!: TradeDto[];

    @ApiProperty({ example: true })
    isVerified!: boolean;

    @ApiProperty({ example: '2025-01-01T00:00:00Z' })
    memberSince!: Date;
}

export class ProviderSearchResponseDto {
    @ApiProperty({ type: [ProviderSearchResultDto] })
    data!: ProviderSearchResultDto[];

    @ApiProperty({ example: 18 })
    total!: number;

    @ApiProperty({ example: 20 })
    limit!: number;

    @ApiProperty({ example: 0 })
    offset!: number;

    @ApiProperty({ example: false })
    hasMore!: boolean;

    @ApiProperty({ description: 'Thời gian xử lý (ms)', example: 9 })
    took!: number;
}



export class ByProvinceQueryDto {
    @ApiProperty({
        description: 'Tỉnh/thành — chọn từ 34 tỉnh',
        enum: VIETNAM_PROVINCES,
        example: 'Đà Nẵng',
    })
    @IsString()
    province!: VietnamProvince;

    @ApiPropertyOptional({ description: 'Số bài đăng trả về', example: 10, default: 10 })
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(50)
    @IsOptional()
    postLimit?: number = 10;

    @ApiPropertyOptional({ description: 'Số thợ trả về', example: 10, default: 10 })
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(50)
    @IsOptional()
    providerLimit?: number = 10;
}

export class ByProvinceResponseDto {
    @ApiProperty({ example: 'Đà Nẵng' })
    province!: string;

    @ApiProperty({ type: [PostSearchResultDto] })
    posts!: PostSearchResultDto[];

    @ApiProperty({ example: 24 })
    totalPosts!: number;

    @ApiProperty({ type: [ProviderSearchResultDto] })
    providers!: ProviderSearchResultDto[];

    @ApiProperty({ example: 7 })
    totalProviders!: number;

    @ApiProperty({ description: 'Thời gian xử lý (ms)', example: 15 })
    took!: number;
}

// ─── 5. Province Suggestion ───────────────────────────────────────────────────

export class ProvinceSuggestResponseDto {
    @ApiProperty({ type: [String], example: ['Đà Nẵng', 'Đắk Lắk'] })
    provinces!: string[];
}

// ─── 6. Trade Catalog ─────────────────────────────────────────────────────────

export class TradeSuggestQueryDto {
    @ApiPropertyOptional({
        description: 'Lọc theo tên nghề (hỗ trợ không dấu). VD: "dien" → "Thợ điện"',
        example: 'dien',
    })
    @IsString()
    @IsOptional()
    q?: string;

    @ApiPropertyOptional({ description: 'Lọc theo nhóm nghề', example: 'Điện - Nước' })
    @IsString()
    @IsOptional()
    category?: string;
}

export class TradeSuggestResponseDto {
    @ApiProperty({ type: [TradeDto] })
    trades!: Array<Omit<TradeDto, 'yearsExperience'>>;

    @ApiProperty({
        type: [String],
        description: 'Tất cả nhóm nghề — dùng render filter tabs',
        example: ['Điện - Nước', 'Xây dựng', 'Nội thất'],
    })
    categories!: string[];
}