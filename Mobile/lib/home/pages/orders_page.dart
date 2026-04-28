import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile_app_doan/core/widgets/app_empty_state.dart';
import 'package:mobile_app_doan/core/widgets/app_error_state.dart';
import 'package:mobile_app_doan/core/widgets/app_list_skeleton.dart';
import 'package:mobile_app_doan/home/controllers/order_controller.dart';
import 'package:mobile_app_doan/home/pages/order_detail_page.dart';

class OrdersPage extends StatefulWidget {
  const OrdersPage({super.key});

  @override
  State<OrdersPage> createState() => _OrdersPageState();
}

class _OrdersPageState extends State<OrdersPage> {
  String? _filter;

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

    return Scaffold(
      backgroundColor: scheme.surfaceContainerLowest,
      appBar: AppBar(
        title: const Text('Đơn hàng'),
        actions: [
          IconButton(onPressed: _reload, icon: const Icon(Icons.refresh)),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 8, 12, 0),
            child: Obx(() {
              final s = oc.stats.value;
              final text = s == null
                  ? ''
                  : 'Tổng: ${s['total'] ?? '—'} · Đang làm: ${s['inProgress'] ?? '—'} · Hoàn thành: ${s['completed'] ?? '—'}';
              if (text.isEmpty) return const SizedBox.shrink();
              return Align(
                alignment: Alignment.centerLeft,
                child: Text(text, style: TextStyle(color: scheme.onSurfaceVariant)),
              );
            }),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  FilterChip(
                    label: const Text('Tất cả'),
                    selected: _filter == null,
                    onSelected: (_) {
                      setState(() => _filter = null);
                      oc.loadOrders(status: null);
                    },
                  ),
                  const SizedBox(width: 6),
                  ...[
                    'pending',
                    'in_progress',
                    'completed',
                    'cancelled',
                  ].map(
                    (st) => Padding(
                      padding: const EdgeInsets.only(right: 6),
                      child: FilterChip(
                        label: Text(st),
                        selected: _filter == st,
                        onSelected: (_) {
                          setState(() => _filter = st);
                          oc.loadOrders(status: st);
                        },
                      ),
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
                  subtitle: 'Đơn từ báo giá và công việc sẽ hiển thị tại đây.',
                  icon: Icons.receipt_long_outlined,
                  actionLabel: 'Làm mới',
                  onAction: _reload,
                );
              }
              return RefreshIndicator(
                onRefresh: _reload,
                child: ListView.separated(
                  padding: const EdgeInsets.all(12),
                  itemCount: oc.orders.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (context, i) {
                    final o = oc.orders[i];
                    final id = o['id']?.toString() ?? '';
                    final num = o['orderNumber']?.toString() ?? id;
                    final title = o['title']?.toString() ?? 'Đơn hàng';
                    final st = o['status']?.toString() ?? '';
                    final price = o['price'] ?? o['totalAmount'];
                    return Card(
                      child: ListTile(
                        title: Text(title, maxLines: 1, overflow: TextOverflow.ellipsis),
                        subtitle: Text('$num · $st'),
                        trailing: Text('$price', style: const TextStyle(fontWeight: FontWeight.w600)),
                        onTap: id.isEmpty
                            ? null
                            : () => Get.to<void>(() => OrderDetailPage(orderId: id)),
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
