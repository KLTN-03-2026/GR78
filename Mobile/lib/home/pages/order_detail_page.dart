import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile_app_doan/core/theme/app_radii.dart';
import 'package:mobile_app_doan/core/theme/app_spacing.dart';
import 'package:mobile_app_doan/core/utils/status_format.dart';
import 'package:mobile_app_doan/core/widgets/widgets.dart';
import 'package:mobile_app_doan/home/controllers/order_controller.dart';
import 'package:mobile_app_doan/home/controllers/review_controller.dart';
import 'package:mobile_app_doan/home/controllers/user_controller.dart';
import 'package:mobile_app_doan/home/pages/reviews_page.dart';

class OrderDetailPage extends StatefulWidget {
  const OrderDetailPage({super.key, required this.orderId});

  final String orderId;

  @override
  State<OrderDetailPage> createState() => _OrderDetailPageState();
}

class _OrderDetailPageState extends State<OrderDetailPage> {
  Map<String, dynamic>? _order;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Get.find<ReviewController>().loadOrderReview(widget.orderId);
    });
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final oc = Get.find<OrderController>();
    final data = await oc.fetchOrder(widget.orderId);
    if (mounted) {
      setState(() {
        _order = data;
        _loading = false;
      });
    }
  }

  String? _myId() => Get.find<ProfileController>().profile.value?.id;

  bool _isProvider(Map<String, dynamic> o) {
    final my = _myId();
    return my != null && o['providerId']?.toString() == my;
  }

  bool _isCustomer(Map<String, dynamic> o) {
    final my = _myId();
    return my != null && o['customerId']?.toString() == my;
  }

  bool _hasProviderCompleted(Map<String, dynamic> o) =>
      o['providerCompletedAt'] != null &&
      o['providerCompletedAt'].toString().isNotEmpty;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final code = _order?['orderNumber']?.toString();

    Widget body;
    if (_loading) {
      body = const AppListSkeleton(itemCount: 3);
    } else if (_order == null) {
      body = AppErrorState(
        message: 'Không tải được đơn hàng',
        onRetry: _load,
      );
    } else {
      body = _buildContent(context, _order!);
    }

    return Scaffold(
      backgroundColor: scheme.surfaceContainerLowest,
      body: Column(
        children: [
          AppPageHeader(
            title: code != null && code.isNotEmpty ? 'Đơn $code' : 'Chi tiết đơn',
            subtitle: 'Theo dõi và cập nhật trạng thái đơn',
            trailing: [
              IconButton(
                tooltip: 'Làm mới',
                onPressed: _load,
                icon: const Icon(Icons.refresh, color: Colors.white),
              ),
            ],
          ),
          Expanded(child: body),
        ],
      ),
    );
  }

  Widget _buildContent(BuildContext context, Map<String, dynamic> o) {
    final scheme = Theme.of(context).colorScheme;
    final money = NumberFormat.decimalPattern('vi_VN');
    final status = o['status']?.toString();
    final info = statusInfo(status);
    final id = o['id']?.toString() ?? '';
    final oc = Get.find<OrderController>();
    final price = o['price'];
    final total = o['totalAmount'];
    final location = o['location']?.toString();
    final title = o['title']?.toString() ?? '';

    String fmtMoney(dynamic v) {
      if (v == null) return '—';
      if (v is num) return '${money.format(v.toInt())} đ';
      return v.toString();
    }

    return ListView(
      padding: const EdgeInsets.all(AppSpacing.sm),
      children: [
        Card(
          margin: EdgeInsets.zero,
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.sm),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        title.isEmpty ? 'Đơn hàng' : title,
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w700,
                            ),
                      ),
                    ),
                    AppStatusBadge(label: info.label, tone: info.tone),
                  ],
                ),
                const SizedBox(height: AppSpacing.sm),
                _DetailRow(
                  icon: LucideIcons.dollarSign,
                  label: 'Giá',
                  value: fmtMoney(price),
                ),
                if (total != null)
                  _DetailRow(
                    icon: LucideIcons.wallet,
                    label: 'Tổng tiền',
                    value: fmtMoney(total),
                  ),
                if (location != null && location.isNotEmpty)
                  _DetailRow(
                    icon: LucideIcons.mapPin,
                    label: 'Địa điểm',
                    value: location,
                  ),
              ],
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        if (status == 'in_progress' &&
            _isProvider(o) &&
            !_hasProviderCompleted(o))
          AppPrimaryButton(
            label: 'Thợ xác nhận hoàn thành',
            onPressed: id.isEmpty
                ? null
                : () async {
                    await oc.providerComplete(id);
                    await _load();
                  },
          ),
        if (status == 'in_progress' &&
            _isCustomer(o) &&
            _hasProviderCompleted(o) &&
            (o['customerCompletedAt'] == null ||
                o['customerCompletedAt'].toString().isEmpty))
          AppPrimaryButton(
            label: 'Khách xác nhận hoàn tất đơn',
            onPressed: id.isEmpty
                ? null
                : () async {
                    await oc.customerComplete(id);
                    await _load();
                  },
          ),
        if (status == 'completed' && _isCustomer(o)) ...[
          const SizedBox(height: AppSpacing.xs),
          SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              onPressed: id.isEmpty
                  ? null
                  : () async {
                      final reviewed = Get.find<ReviewController>()
                              .currentReview
                              .value !=
                          null;
                      if (reviewed) {
                        Get.snackbar('Đã đánh giá',
                            'Bạn đã đánh giá đơn hàng này.');
                        return;
                      }
                      if (!context.mounted) return;
                      await showModalBottomSheet<bool>(
                        context: context,
                        isScrollControlled: true,
                        builder: (_) => CreateReviewSheet(orderId: id),
                      );
                      await Get.find<ReviewController>().loadOrderReview(id);
                    },
              icon: const Icon(Icons.star_outline, size: 18),
              label: const Text('Đánh giá đơn hàng'),
            ),
          ),
        ],
        if (status != 'completed' && status != 'cancelled') ...[
          const SizedBox(height: AppSpacing.xs),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              icon: Icon(Icons.cancel_outlined, color: scheme.error),
              label: Text(
                'Hủy đơn hàng',
                style: TextStyle(color: scheme.error),
              ),
              onPressed: id.isEmpty
                  ? null
                  : () async {
                      final ctrl = TextEditingController();
                      final ok = await showDialog<bool>(
                        context: context,
                        builder: (ctx) => AlertDialog(
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(AppRadii.lg),
                          ),
                          title: const Text('Hủy đơn'),
                          content: TextField(
                            controller: ctrl,
                            decoration: const InputDecoration(
                              labelText: 'Lý do (tuỳ chọn)',
                            ),
                          ),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.pop(ctx, false),
                              child: const Text('Đóng'),
                            ),
                            FilledButton(
                              style: FilledButton.styleFrom(
                                backgroundColor: scheme.error,
                              ),
                              onPressed: () => Navigator.pop(ctx, true),
                              child: const Text('Hủy đơn'),
                            ),
                          ],
                        ),
                      );
                      if (ok == true && mounted) {
                        final r = ctrl.text.trim().isEmpty
                            ? null
                            : ctrl.text.trim();
                        await oc.cancel(id, reason: r);
                        await _load();
                      }
                    },
            ),
          ),
        ],
      ],
    );
  }
}

class _DetailRow extends StatelessWidget {
  const _DetailRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.xs),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: theme.colorScheme.primary),
          const SizedBox(width: AppSpacing.xs),
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: theme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
