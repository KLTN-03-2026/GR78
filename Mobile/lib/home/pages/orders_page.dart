import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile_app_doan/core/theme/app_spacing.dart';
import 'package:mobile_app_doan/core/utils/status_format.dart';
import 'package:mobile_app_doan/core/widgets/widgets.dart';
import 'package:mobile_app_doan/home/controllers/order_controller.dart';
import 'package:mobile_app_doan/home/pages/order_detail_page.dart';

class OrdersPage extends StatefulWidget {
  const OrdersPage({super.key});

  @override
  State<OrdersPage> createState() => _OrdersPageState();
}

class _OrdersPageState extends State<OrdersPage> {
  String? _filter;

  static const _filters = <_StatusFilter>[
    _StatusFilter(null, 'Tất cả'),
    _StatusFilter('pending', 'Đang chờ'),
    _StatusFilter('in_progress', 'Đang làm'),
    _StatusFilter('completed', 'Hoàn thành'),
    _StatusFilter('cancelled', 'Đã hủy'),
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final oc = Get.find<OrderController>();
      oc.loadOrders(status: _filter);
      oc.loadStats();
    });
  }

  Future<void> _reload() async {
    final oc = Get.find<OrderController>();
    await oc.loadOrders(status: _filter);
    await oc.loadStats();
  }

  @override
  Widget build(BuildContext context) {
    final oc = Get.find<OrderController>();
    final scheme = Theme.of(context).colorScheme;
    final money = NumberFormat.decimalPattern('vi_VN');

    return Scaffold(
      backgroundColor: scheme.surfaceContainerLowest,
      body: Column(
        children: [
          AppPageHeader(
            title: 'Đơn hàng',
            subtitle: 'Theo dõi tất cả đơn hàng của bạn',
            trailing: [
              IconButton(
                tooltip: 'Làm mới',
                onPressed: _reload,
                icon: const Icon(Icons.refresh, color: Colors.white),
              ),
            ],
            bottom: Obx(() {
              final s = oc.stats.value;
              if (s == null) return const SizedBox.shrink();
              final total = s['total']?.toString() ?? '—';
              final inProg = s['inProgress']?.toString() ?? '—';
              final done = s['completed']?.toString() ?? '—';
              return Row(
                children: [
                  _HeaderStat(label: 'Tổng', value: total),
                  const SizedBox(width: AppSpacing.xs),
                  _HeaderStat(label: 'Đang làm', value: inProg),
                  const SizedBox(width: AppSpacing.xs),
                  _HeaderStat(label: 'Hoàn thành', value: done),
                ],
              );
            }),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.xs,
              AppSpacing.xs + 4,
              AppSpacing.xs,
              0,
            ),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  for (final f in _filters)
                    Padding(
                      padding: const EdgeInsets.only(right: AppSpacing.xxs),
                      child: FilterChip(
                        showCheckmark: false,
                        selected: _filter == f.status,
                        label: Text(f.label),
                        onSelected: (_) {
                          setState(() => _filter = f.status);
                          Get.find<OrderController>().loadOrders(status: f.status);
                        },
                      ),
                    ),
                ],
              ),
            ),
          ),
          Expanded(
            child: Obx(() {
              if (oc.isLoading.value && oc.orders.isEmpty) {
                return const AppListSkeleton(itemCount: 4);
              }
              if (oc.orders.isEmpty) {
                final err = oc.errorMessage.value;
                if (err.isNotEmpty) {
                  return AppErrorState(message: err, onRetry: _reload);
                }
                return AppEmptyState(
                  title: 'Chưa có đơn hàng',
                  subtitle:
                      'Đơn từ báo giá và công việc sẽ hiển thị tại đây.',
                  icon: LucideIcons.receipt,
                  actionLabel: 'Làm mới',
                  onAction: _reload,
                );
              }
              return RefreshIndicator(
                onRefresh: _reload,
                child: ListView.separated(
                  padding: const EdgeInsets.all(AppSpacing.sm),
                  itemCount: oc.orders.length,
                  separatorBuilder: (_, __) =>
                      const SizedBox(height: AppSpacing.xs),
                  itemBuilder: (context, i) {
                    final o = oc.orders[i];
                    final id = o['id']?.toString() ?? '';
                    final code = o['orderNumber']?.toString() ?? id;
                    final title = o['title']?.toString() ?? 'Đơn hàng';
                    final status = o['status']?.toString();
                    final price = o['price'] ?? o['totalAmount'];
                    final priceStr = price is num
                        ? money.format(price.toInt())
                        : (price?.toString() ?? '—');

                    final info = statusInfo(status);

                    return AppListCard(
                      title: title,
                      subtitle: 'Mã: ${code.isEmpty ? '—' : code}',
                      leading: CircleAvatar(
                        backgroundColor: scheme.primaryContainer,
                        child: Icon(LucideIcons.receipt,
                            color: scheme.primary, size: 18),
                      ),
                      trailing: AppStatusBadge(
                        label: info.label,
                        tone: info.tone,
                        dense: true,
                      ),
                      body: Row(
                        children: [
                          Icon(LucideIcons.dollarSign,
                              size: 14, color: scheme.secondary),
                          const SizedBox(width: 4),
                          Text(
                            '$priceStr đ',
                            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                  fontWeight: FontWeight.w700,
                                  color: scheme.onSurface,
                                ),
                          ),
                        ],
                      ),
                      onTap: id.isEmpty
                          ? null
                          : () => Get.to<void>(
                                () => OrderDetailPage(orderId: id),
                              ),
                    );
                  },
                ),
              );
            }),
          ),
        ],
      ),
    );
  }
}

class _StatusFilter {
  const _StatusFilter(this.status, this.label);
  final String? status;
  final String label;
}

class _HeaderStat extends StatelessWidget {
  const _HeaderStat({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.xs + 2,
        vertical: 6,
      ),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.16),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.85),
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}
