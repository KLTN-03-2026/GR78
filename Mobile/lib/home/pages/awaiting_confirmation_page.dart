import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile_app_doan/core/theme/app_spacing.dart';
import 'package:mobile_app_doan/core/utils/status_format.dart';
import 'package:mobile_app_doan/core/widgets/app_empty_state.dart';
import 'package:mobile_app_doan/core/widgets/app_list_skeleton.dart';
import 'package:mobile_app_doan/core/widgets/app_page_header.dart';
import 'package:mobile_app_doan/core/widgets/app_status_badge.dart';
import 'package:mobile_app_doan/home/controllers/order_controller.dart';
import 'package:mobile_app_doan/home/pages/order_detail_page.dart';

/// Trang dành riêng cho thợ: danh sách đơn PENDING chờ xác nhận / từ chối.
class AwaitingConfirmationPage extends StatefulWidget {
  const AwaitingConfirmationPage({super.key});

  @override
  State<AwaitingConfirmationPage> createState() => _AwaitingConfirmationPageState();
}

class _AwaitingConfirmationPageState extends State<AwaitingConfirmationPage> {
  List<Map<String, dynamic>> _orders = [];
  bool _loading = true;
  int _total = 0;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load({int page = 1}) async {
    setState(() => _loading = true);
    final oc = Get.find<OrderController>();
    final data = await oc.fetchAwaitingConfirmation(page: page);
    if (mounted) {
      setState(() {
        _loading = false;
        if (data != null) {
          final raw = data['data'];
          if (raw is List) {
            _orders = raw.whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
          }
          _total = (data['meta']?['total'] as num?)?.toInt() ??
              (data['total'] as num?)?.toInt() ?? 0;
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Scaffold(
      backgroundColor: scheme.surfaceContainerLowest,
      body: Column(
        children: [
          AppPageHeader(
            title: 'Đơn chờ xác nhận',
            subtitle:
                _loading ? null : '$_total đơn đang chờ bạn xử lý',
            trailing: [
              IconButton(
                tooltip: 'Làm mới',
                icon: const Icon(Icons.refresh, color: Colors.white),
                onPressed: _load,
              ),
            ],
          ),
          Expanded(
            child: _loading
                ? const AppListSkeleton(itemCount: 3)
                : _orders.isEmpty
                    ? AppEmptyState(
                        title: 'Không có đơn chờ xác nhận',
                        subtitle:
                            'Khi khách chọn thẳng báo giá, đơn sẽ xuất hiện tại đây.',
                        icon: Icons.task_alt_outlined,
                        actionLabel: 'Làm mới',
                        onAction: _load,
                      )
                    : RefreshIndicator(
                        onRefresh: _load,
                        child: ListView.separated(
                          padding: const EdgeInsets.all(AppSpacing.sm),
                          itemCount: _orders.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(height: AppSpacing.xs),
                          itemBuilder: (ctx, i) => _PendingOrderCard(
                            order: _orders[i],
                            onConfirm: (quoteId) async {
                              final oc = Get.find<OrderController>();
                              await oc.confirmFromQuote(quoteId);
                              await _load();
                            },
                            onDecline: (orderId) async {
                              final oc = Get.find<OrderController>();
                              await oc.providerDecline(orderId);
                              await _load();
                            },
                          ),
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}

class _PendingOrderCard extends StatelessWidget {
  const _PendingOrderCard({
    required this.order,
    required this.onConfirm,
    required this.onDecline,
  });

  final Map<String, dynamic> order;
  final Future<void> Function(String quoteId) onConfirm;
  final Future<void> Function(String orderId) onDecline;

  @override
  Widget build(BuildContext context) {
    final id = order['id']?.toString() ?? '';
    final quoteId = order['quoteId']?.toString() ?? '';
    final title = order['title']?.toString() ?? 'Đơn hàng';
    final num = order['orderNumber']?.toString() ?? id;
    final price = order['price'] ?? order['totalAmount'];
    final pendingInfo = statusInfo('pending');

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.sm),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: id.isEmpty ? null : () => Get.to<void>(() => OrderDetailPage(orderId: id)),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(title,
                            style: const TextStyle(fontWeight: FontWeight.w600),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis),
                        Text('Mã: $num · ${price ?? '?'} đ',
                            style: const TextStyle(fontSize: 12)),
                      ],
                    ),
                  ),
                ),
                AppStatusBadge(
                  label: pendingInfo.label,
                  tone: pendingInfo.tone,
                  dense: true,
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: FilledButton.icon(
                    onPressed: quoteId.isEmpty ? null : () => onConfirm(quoteId),
                    icon: const Icon(Icons.check, size: 16),
                    label: const Text('Xác nhận'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: id.isEmpty ? null : () => _confirmDecline(context, id),
                    icon: const Icon(Icons.close, size: 16),
                    label: const Text('Từ chối'),
                    style: OutlinedButton.styleFrom(foregroundColor: Colors.red),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _confirmDecline(BuildContext context, String orderId) async {
    final ctrl = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Từ chối đơn?'),
        content: TextField(
          controller: ctrl,
          decoration: const InputDecoration(labelText: 'Lý do (tuỳ chọn)'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Hủy')),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Từ chối'),
          ),
        ],
      ),
    );
    if (ok == true) {
      await onDecline(orderId);
    }
  }
}
