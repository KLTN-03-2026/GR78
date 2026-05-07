import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import {
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
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
    TradeSuggestQueryDto,
    TradeSuggestResponseDto,
} from './dtos/search.dto';
import { SearchService } from './services/search.service';

@ApiTags('Search')
@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService) { }


    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Global search — tìm cả bài đăng lẫn thợ',
        description:
            'Tìm đồng thời bài đăng và thợ trong 1 request. ' +
            'Dùng cho search bar header/homepage. ' +
            'Chỉ cần 1 ký tự. Hỗ trợ lọc province và giới hạn type.',
    })
    @ApiResponse({ status: HttpStatus.OK, type: GlobalSearchResponseDto })
    async globalSearch(
        @Query() query: GlobalSearchQueryDto,
    ): Promise<GlobalSearchResponseDto> {
        return this.searchService.globalSearch(query);
    }


    @Get('posts')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Tìm kiếm bài đăng',
        description:
            'Tìm bài đăng theo:\n' +
            '  • title — 1 ký tự trở lên, hỗ trợ không dấu\n' +
            '  • province — lọc cứng 34 tỉnh/thành\n' +
            '  • tradeSlugs — lọc bài đăng liên quan đến ngành nghề\n' +
            '  • budgetMin / budgetMax — khoảng ngân sách\n' +
            '  • sortBy / order — sắp xếp\n' +
            'Mặc định chỉ trả về bài OPEN.',
    })
    @ApiResponse({ status: HttpStatus.OK, type: PostSearchResponseDto })
    async searchPosts(
        @Query() query: PostSearchQueryDto,
    ): Promise<PostSearchResponseDto> {
        return this.searchService.searchPosts(query);
    }


    @Get('providers')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Tìm kiếm thợ (Provider)',
        description:
            'Tìm thợ theo:\n' +
            '  • displayName — 1 ký tự trở lên, hỗ trợ không dấu\n' +
            '  • province — lọc cứng 34 tỉnh/thành\n' +
            '  • tradeSlugs — lọc cứng theo nghề đã đăng ký (OR logic)\n' +
            'Kết quả luôn kèm danh sách nghề + số năm kinh nghiệm.',
    })
    @ApiResponse({ status: HttpStatus.OK, type: ProviderSearchResponseDto })
    async searchProviders(
        @Query() query: ProviderSearchQueryDto,
    ): Promise<ProviderSearchResponseDto> {
        return this.searchService.searchProviders(query);
    }


    @Get('by-province')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Lọc theo tỉnh/thành — trả về cả bài đăng lẫn thợ',
        description:
            'Lọc cứng theo 1 tỉnh/thành trong 34 tỉnh được hỗ trợ. ' +
            'Trả về bài đăng (OPEN) và thợ đang hoạt động tại tỉnh đó trong 1 request. ' +
            'Dùng cho trang "Xem dịch vụ theo khu vực".',
    })
    @ApiResponse({ status: HttpStatus.OK, type: ByProvinceResponseDto })
    async searchByProvince(
        @Query() query: ByProvinceQueryDto,
    ): Promise<ByProvinceResponseDto> {
        return this.searchService.searchByProvince(query);
    }


    @Get('provinces')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Danh sách tỉnh/thành (autocomplete)',
        description:
            'Trả về 34 tỉnh/thành, lọc theo q nếu có. ' +
            'Không truyền q → trả về đủ 34. Dùng cho dropdown/autocomplete.',
    })
    @ApiQuery({ name: 'q', required: false, example: 'Đà' })
    @ApiResponse({ status: HttpStatus.OK, type: ProvinceSuggestResponseDto })
    async suggestProvinces(
        @Query('q') q?: string,
    ): Promise<ProvinceSuggestResponseDto> {
        return this.searchService.suggestProvinces(q);
    }


    @Get('trades')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Danh mục nghề nghiệp (catalog + autocomplete)',
        description:
            'Trả về danh sách nghề đang hoạt động + nhóm nghề. ' +
            'Lọc theo tên (q, hỗ trợ không dấu) hoặc nhóm (category). ' +
            'Dùng slug từ response làm tradeSlugs ở /search/providers hoặc /search/posts.',
    })
    @ApiQuery({ name: 'q', required: false, example: 'dien' })
    @ApiQuery({ name: 'category', required: false, example: 'Điện - Nước' })
    @ApiResponse({ status: HttpStatus.OK, type: TradeSuggestResponseDto })
    async suggestTrades(
        @Query() query: TradeSuggestQueryDto,
    ): Promise<TradeSuggestResponseDto> {
        return this.searchService.suggestTrades(query);
    }
}