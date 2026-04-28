import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile_app_doan/core/widgets/app_error_state.dart';
import 'package:mobile_app_doan/core/widgets/app_list_skeleton.dart';
import 'package:mobile_app_doan/home/controllers/order_controller.dart';
import 'package:mobile_app_doan/home/controllers/user_controller.dart';

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
    if (_loading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Chi tiết đơn')),
        body: const AppListSkeleton(itemCount: 3),
      );
    }
    if (_order == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Chi tiết đơn')),
        body: AppErrorState(
          message: 'Không tải được đơn hàng',
          onRetry: _load,
        ),
      );
    }

    final o = _order!;
    final status = o['status']?.toString() ?? '';
    final oc = Get.find<OrderController>();
    final id = o['id']?.toString() ?? '';

    return Scaffold(
      appBar: AppBar(
        title: Text(o['orderNumber']?.toString() ?? 'Đơn hàng'),
        actions: [
          IconButton(onPressed: _load, icon: const Icon(Icons.refresh)),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(o['title']?.toString() ?? '', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 8),
          Text('Trạng thái: $status'),
          if (o['price'] != null) Text('Giá: ${o['price']}'),
          if (o['totalAmount'] != null) Text('Tổng: ${o['totalAmount']}'),
          if (o['location'] != null && o['location'].toString().isNotEmpty)
            Text('Địa điểm: ${o['location']}'),
          const Divider(height: 32),
          if (status == 'in_progress' && _isProvider(o) && !_hasProviderCompleted(o))
            FilledButton(
              onPressed: id.isEmpty
                  ? null
                  : () async {
                      await oc.providerComplete(id);
                      await _load();
                    },
              child: const Text('Thợ xác nhận hoàn thành'),
            ),
          if (status == 'in_progress' &&
              _isCustomer(o) &&
              _hasProviderCompleted(o) &&
              (o['customerCompletedAt'] == null ||
                  o['customerCompletedAt'].toString().isEmpty))
            FilledButton(
              onPressed: id.isEmpty
                  ? null
                  : () async {
                      await oc.customerComplete(id);
                      await _load();
                    },
              child: const Text('Khách xác nhận hoàn tất đơn'),
            ),
          if (status != 'completed' && status != 'cancelled') ...[
            const SizedBox(height: 12),
            OutlinedButton(
              onPressed: id.isEmpty
                  ? null
                  : () async {
                      final ctrl = TextEditingController();
                      final ok = await showDialog<bool>(
                        context: context,
                        builder: (ctx) => AlertDialog(
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
                              onPressed: () => Navigator.pop(ctx, true),
                              child: const Text('Hủy đơn'),
                            ),
                          ],
                        ),
                      );
                      if (ok == true && mounted) {
                        final r = ctrl.text.trim().isEmpty ? null : ctrl.text.trim();
                        await oc.cancel(id, reason: r);
                        await _load();
                      }
                    },
              child: const Text('Hủy đơn hàng'),
            ),
          ],
        ],
      ),
    );
  }
}
