import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:mobile_app_doan/core/theme/app_spacing.dart';
import 'package:mobile_app_doan/core/widgets/app_empty_state.dart';
import 'package:mobile_app_doan/core/widgets/app_list_skeleton.dart';
import 'package:mobile_app_doan/core/widgets/app_page_header.dart';
import 'package:mobile_app_doan/home/controllers/subscription_controller.dart';

class SubscriptionPage extends StatefulWidget {
  const SubscriptionPage({super.key});

  @override
  State<SubscriptionPage> createState() => _SubscriptionPageState();
}

class _SubscriptionPageState extends State<SubscriptionPage> with SingleTickerProviderStateMixin {
  late final TabController _tabs;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 2, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final sc = Get.find<SubscriptionController>();
      sc.loadMySubscription();
      sc.loadMySubscriptionStatus();
      sc.loadPlans();
      sc.loadMyPayments();
    });
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Scaffold(
      backgroundColor: scheme.surfaceContainerLowest,
      body: Column(
        children: [
          const AppPageHeader(
            title: 'Gói dịch vụ',
            subtitle: 'Theo dõi gói đăng ký và thanh toán',
          ),
          Material(
            color: scheme.primary,
            child: TabBar(
              controller: _tabs,
              labelColor: scheme.onPrimary,
              unselectedLabelColor: scheme.onPrimary.withValues(alpha: 0.75),
              indicatorColor: scheme.onPrimary,
              indicatorWeight: 3,
              tabs: const [
                Tab(text: 'Gói & Trạng thái'),
                Tab(text: 'Lịch sử thanh toán'),
              ],
            ),
          ),
          Expanded(
            child: TabBarView(
              controller: _tabs,
              children: const [
                _SubscriptionStatusTab(),
                _PaymentHistoryTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SubscriptionStatusTab extends StatelessWidget {
  const _SubscriptionStatusTab();

  @override
  Widget build(BuildContext context) {
    final sc = Get.find<SubscriptionController>();

    return Obx(() {
      if (sc.isLoading.value) return const AppListSkeleton(itemCount: 3);

      return RefreshIndicator(
        onRefresh: () async {
          await sc.loadMySubscription();
          await sc.loadMySubscriptionStatus();
          await sc.loadPlans();
        },
        child: ListView(
          padding: const EdgeInsets.all(AppSpacing.sm),
          children: [
            _StatusCard(status: sc.subscriptionStatus.value),
            const SizedBox(height: 16),
            if (sc.subscription.value != null) _SubscriptionCard(sub: sc.subscription.value!),
            const SizedBox(height: 16),
            Text('Gói có sẵn', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            ...sc.plans.map((plan) => _PlanCard(plan: plan)),
          ],
        ),
      );
    });
  }
}

class _StatusCard extends StatelessWidget {
  const _StatusCard({required this.status});
  final Map<String, dynamic>? status;

  @override
  Widget build(BuildContext context) {
    if (status == null) {
      return const Card(
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Text('Chưa có gói dịch vụ'),
        ),
      );
    }

    final allowed = status!['isAccessAllowed'] == true;
    final msg = status!['statusMessage']?.toString() ?? '';
    final days = status!['daysUntilExpiry'];

    return Card(
      color: allowed
          ? Colors.green.withValues(alpha: 0.08)
          : Colors.orange.withValues(alpha: 0.08),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.sm),
        child: Row(
          children: [
            Icon(
              allowed ? Icons.check_circle : Icons.warning_amber_rounded,
              color: allowed ? Colors.green : Colors.orange,
              size: 36,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    allowed ? 'Đang hoạt động' : 'Cần gia hạn',
                    style: const TextStyle(fontWeight: FontWeight.w700),
                  ),
                  if (msg.isNotEmpty) Text(msg, style: const TextStyle(fontSize: 13)),
                  if (days != null)
                    Text('Còn $days ngày', style: const TextStyle(fontSize: 12)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SubscriptionCard extends StatelessWidget {
  const _SubscriptionCard({required this.sub});
  final Map<String, dynamic> sub;

  @override
  Widget build(BuildContext context) {
    final fmt = DateFormat('dd/MM/yyyy');
    final status = sub['status']?.toString() ?? '';
    final plan = sub['plan'];
    final planName = (plan is Map) ? plan['name']?.toString() ?? '' : '';
    final endDate = sub['currentPeriodEnd'];
    final cancelledAt = sub['cancelledAt'];

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.sm),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Gói hiện tại', style: Theme.of(context).textTheme.titleSmall),
            const SizedBox(height: 8),
            if (planName.isNotEmpty)
              Text(planName, style: const TextStyle(fontWeight: FontWeight.w600)),
            Text('Trạng thái: $status'),
            if (endDate != null)
              Text('Hết hạn: ${fmt.format(DateTime.tryParse(endDate.toString()) ?? DateTime.now())}'),
            if (cancelledAt == null && status == 'active') ...[
              const SizedBox(height: 8),
              OutlinedButton.icon(
                onPressed: () async {
                  final ctrl = TextEditingController();
                  final ok = await showDialog<bool>(
                    context: context,
                    builder: (ctx) => AlertDialog(
                      title: const Text('Hủy gói dịch vụ?'),
                      content: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Text('Bạn vẫn có thể dùng dịch vụ đến hết kỳ hiện tại.'),
                          const SizedBox(height: 8),
                          TextField(
                            controller: ctrl,
                            decoration: const InputDecoration(labelText: 'Lý do (tuỳ chọn)'),
                          ),
                        ],
                      ),
                      actions: [
                        TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Không')),
                        FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Hủy gói')),
                      ],
                    ),
                  );
                  if (ok == true) {
                    await Get.find<SubscriptionController>().cancelSubscription(
                      reason: ctrl.text.trim().isEmpty ? null : ctrl.text.trim(),
                    );
                  }
                },
                icon: const Icon(Icons.cancel_outlined, size: 16),
                label: const Text('Hủy gói'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _PlanCard extends StatelessWidget {
  const _PlanCard({required this.plan});
  final Map<String, dynamic> plan;

  @override
  Widget build(BuildContext context) {
    final name = plan['name']?.toString() ?? '';
    final price = plan['price'];
    final cycle = plan['billingCycle']?.toString() ?? '';
    final features = plan['features'];
    final List<dynamic> featureList = (features is List) ? features : [];

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.sm),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                ),
                Text(
                  '${price ?? '?'}đ / $cycle',
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.primary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            if (featureList.isNotEmpty) ...[
              const SizedBox(height: 8),
              ...featureList.map(
                (f) => Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Row(
                    children: [
                      const Icon(Icons.check, size: 14, color: Colors.green),
                      const SizedBox(width: 6),
                      Expanded(child: Text(f.toString(), style: const TextStyle(fontSize: 13))),
                    ],
                  ),
                ),
              ),
            ],
            const SizedBox(height: 10),
            FilledButton(
              onPressed: () => _showSubscribeDialog(context, plan['id']?.toString() ?? ''),
              child: const Text('Đăng ký'),
            ),
          ],
        ),
      ),
    );
  }

  void _showSubscribeDialog(BuildContext context, String planId) {
    final discountCtrl = TextEditingController();
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Đăng ký gói'),
        content: TextField(
          controller: discountCtrl,
          decoration: const InputDecoration(labelText: 'Mã giảm giá (tuỳ chọn)'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Hủy')),
          FilledButton(
            onPressed: () async {
              Navigator.pop(ctx);
              await Get.find<SubscriptionController>().subscribe(
                planId,
                discountCode: discountCtrl.text.trim().isEmpty ? null : discountCtrl.text.trim(),
              );
            },
            child: const Text('Xác nhận'),
          ),
        ],
      ),
    );
  }
}

class _PaymentHistoryTab extends StatelessWidget {
  const _PaymentHistoryTab();

  @override
  Widget build(BuildContext context) {
    final sc = Get.find<SubscriptionController>();
    final fmt = DateFormat('dd/MM/yyyy HH:mm');

    return Obx(() {
      if (sc.isLoading.value && sc.payments.isEmpty) {
        return const AppListSkeleton(itemCount: 4);
      }
      if (sc.payments.isEmpty) {
        return AppEmptyState(
          title: 'Chưa có lịch sử thanh toán',
          icon: Icons.receipt_long_outlined,
          actionLabel: 'Làm mới',
          onAction: sc.loadMyPayments,
        );
      }
      return ListView.separated(
        padding: const EdgeInsets.all(AppSpacing.sm),
        itemCount: sc.payments.length,
        separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.xs),
        itemBuilder: (ctx, i) {
          final p = sc.payments[i];
          final status = p['status']?.toString() ?? '';
          final amount = p['amount'];
          final createdAt = p['createdAt'];
          final date = createdAt != null
              ? fmt.format(DateTime.tryParse(createdAt.toString()) ?? DateTime.now())
              : '—';

          Color statusColor = switch (status) {
            'confirmed' => Colors.green,
            'pending' => Colors.orange,
            'cancelled' || 'refunded' => Colors.red,
            _ => Colors.grey,
          };

          return Card(
            child: ListTile(
              leading: Icon(Icons.payment, color: statusColor),
              title: Text('${amount ?? '?'}đ', style: const TextStyle(fontWeight: FontWeight.w600)),
              subtitle: Text(date),
              trailing: Chip(
                label: Text(status, style: const TextStyle(fontSize: 11)),
                backgroundColor: statusColor.withValues(alpha: 0.12),
                labelStyle: TextStyle(color: statusColor),
              ),
            ),
          );
        },
      );
    });
  }
}
