export interface TradeSeedItem {
    name: string;
    slug: string;
    category: string;
    sortOrder: number;
}

export const TRADE_SEED_DATA: TradeSeedItem[] = [
    { name: 'Thợ điện', slug: 'tho-dien', category: 'Điện - Nước', sortOrder: 1 },
    { name: 'Thợ nước', slug: 'tho-nuoc', category: 'Điện - Nước', sortOrder: 2 },
    { name: 'Thợ điện nước', slug: 'tho-dien-nuoc', category: 'Điện - Nước', sortOrder: 3 },
    { name: 'Thợ lắp điều hòa', slug: 'tho-lap-dieu-hoa', category: 'Điện - Nước', sortOrder: 4 },
    { name: 'Thợ sửa máy bơm', slug: 'tho-sua-may-bom', category: 'Điện - Nước', sortOrder: 5 },

    // ── Xây dựng ───────────────────────────────────────────────────────────────
    { name: 'Thợ xây', slug: 'tho-xay', category: 'Xây dựng', sortOrder: 10 },
    { name: 'Thợ hồ', slug: 'tho-ho', category: 'Xây dựng', sortOrder: 11 },
    { name: 'Thợ sơn', slug: 'tho-son', category: 'Xây dựng', sortOrder: 12 },
    { name: 'Thợ chống thấm', slug: 'tho-chong-tham', category: 'Xây dựng', sortOrder: 13 },
    { name: 'Thợ lợp mái', slug: 'tho-lop-mai', category: 'Xây dựng', sortOrder: 14 },
    { name: 'Thợ đổ bê tông', slug: 'tho-do-be-tong', category: 'Xây dựng', sortOrder: 15 },

    // ── Nội thất ───────────────────────────────────────────────────────────────
    { name: 'Thợ mộc', slug: 'tho-moc', category: 'Nội thất', sortOrder: 20 },
    { name: 'Thợ lắp đồ gỗ', slug: 'tho-lap-do-go', category: 'Nội thất', sortOrder: 21 },
    { name: 'Thợ ốp lát gạch', slug: 'tho-op-lat-gach', category: 'Nội thất', sortOrder: 22 },
    { name: 'Thợ trần thạch cao', slug: 'tho-tran-thach-cao', category: 'Nội thất', sortOrder: 23 },
    { name: 'Thợ sàn gỗ', slug: 'tho-san-go', category: 'Nội thất', sortOrder: 24 },

    // ── Thiết bị gia dụng ─────────────────────────────────────────────────────
    { name: 'Thợ sửa máy giặt', slug: 'tho-sua-may-giat', category: 'Thiết bị gia dụng', sortOrder: 30 },
    { name: 'Thợ sửa tủ lạnh', slug: 'tho-sua-tu-lanh', category: 'Thiết bị gia dụng', sortOrder: 31 },
    { name: 'Thợ sửa bếp gas', slug: 'tho-sua-bep-gas', category: 'Thiết bị gia dụng', sortOrder: 32 },
    { name: 'Thợ sửa máy lạnh', slug: 'tho-sua-may-lanh', category: 'Thiết bị gia dụng', sortOrder: 33 },
    { name: 'Thợ sửa máy nước nóng', slug: 'tho-sua-may-nuoc-nong', category: 'Thiết bị gia dụng', sortOrder: 34 },

    // ── Cơ khí - Xe ───────────────────────────────────────────────────────────
    { name: 'Thợ sửa xe máy', slug: 'tho-sua-xe-may', category: 'Cơ khí - Xe', sortOrder: 40 },
    { name: 'Thợ sửa ô tô', slug: 'tho-sua-o-to', category: 'Cơ khí - Xe', sortOrder: 41 },
    { name: 'Thợ hàn', slug: 'tho-han', category: 'Cơ khí - Xe', sortOrder: 42 },
    { name: 'Thợ tiện', slug: 'tho-tien', category: 'Cơ khí - Xe', sortOrder: 43 },

    // ── Dọn dẹp - Vệ sinh ─────────────────────────────────────────────────────
    { name: 'Dọn dẹp nhà cửa', slug: 'don-dep-nha-cua', category: 'Dọn dẹp - Vệ sinh', sortOrder: 50 },
    { name: 'Vệ sinh máy lạnh', slug: 've-sinh-may-lanh', category: 'Dọn dẹp - Vệ sinh', sortOrder: 51 },
    { name: 'Vệ sinh công nghiệp', slug: 've-sinh-cong-nghiep', category: 'Dọn dẹp - Vệ sinh', sortOrder: 52 },
    { name: 'Giặt sofa - thảm', slug: 'giat-sofa-tham', category: 'Dọn dẹp - Vệ sinh', sortOrder: 53 },

    // ── Khác ──────────────────────────────────────────────────────────────────
    { name: 'Thợ khóa', slug: 'tho-khoa', category: 'Khác', sortOrder: 60 },
    { name: 'Thợ kính', slug: 'tho-kinh', category: 'Khác', sortOrder: 61 },
    { name: 'Thợ chụp ảnh', slug: 'tho-chup-anh', category: 'Khác', sortOrder: 62 },
    { name: 'Thợ điều dưỡng tại nhà', slug: 'tho-dieu-duong-tai-nha', category: 'Khác', sortOrder: 63 },
    { name: 'Bảo vệ', slug: 'bao-ve', category: 'Khác', sortOrder: 64 },
];


import { Trade } from '@/modules/profile/entities/trade.entity';
import { DataSource } from 'typeorm';

export class TradeSeeder {
    static async run(dataSource: DataSource): Promise<void> {
        const repo = dataSource.getRepository(Trade);

        console.log('🌱 Seeding trades...');

        for (const item of TRADE_SEED_DATA) {
            const exists = await repo.findOne({ where: { slug: item.slug } });
            if (!exists) {
                await repo.save(repo.create({ ...item, isActive: true }));
                console.log(`Created: ${item.name}`);
            } else {
                console.log(`Skipped (exists): ${item.name}`);
            }
        }

        console.log('Trade seeding complete.');
    }
}