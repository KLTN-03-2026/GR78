import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile_app_doan/core/theme/app_radii.dart';
import 'package:mobile_app_doan/core/theme/app_spacing.dart';
import 'package:mobile_app_doan/core/utils/status_format.dart';
import 'package:mobile_app_doan/core/widgets/widgets.dart';
import 'package:mobile_app_doan/home/controllers/order_controller.dart';
import 'package:mobile_app_doan/home/controllers/quote_controller.dart';
import 'package:mobile_app_doan/home/utils/parse_api_list.dart';
import 'package:openapi/openapi.dart';

/// Danh sách báo giá của thợ (OpenAPI GET /quotes/my-quotes).
class MyQuotesPage extends StatefulWidget {
  const MyQuotesPage({super.key});

  @override
  State<MyQuotesPage> createState() => _MyQuotesPageState();
}

class _MyQuotesPageState extends State<MyQuotesPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Get.find<QuoteController>().loadMyQuotes();
    });
  }

  String _quoteId(Map<String, dynamic> q) =>
      (q['id'] ?? q['_id'] ?? '').toString();

  @override
  Widget build(BuildContext context) {
    final qc = Get.find<QuoteController>();
    final scheme = Theme.of(context).colorScheme;
    final money = NumberFormat.decimalPattern('vi_VN');

    return Scaffold(
      backgroundColor: scheme.surfaceContainerLowest,
      body: Column(
        children: [
          AppPageHeader(
            title: 'Báo giá đã gửi',
            subtitle: 'Quản lý báo giá bạn đã gửi cho khách hàng',
            trailing: [
              IconButton(
                tooltip: 'Làm mới',
                onPressed: qc.loadMyQuotes,
                icon: const Icon(Icons.refresh, color: Colors.white),
              ),
            ],
          ),
          Expanded(
            child: Obx(() {
              if (qc.isLoading.value && qc.myQuotes.isEmpty) {
                return const AppListSkeleton(itemCount: 4);
              }
              if (qc.myQuotes.isEmpty) {
                final err = qc.errorMessage.value;
                if (err.isNotEmpty) {
                  return AppErrorState(
                    message: err,
                    onRetry: qc.loadMyQuotes,
                  );
                }
                return AppEmptyState(
                  title: 'Chưa có báo giá',
                  subtitle: 'Gửi báo giá từ bài đăng trên trang chủ.',
                  icon: LucideIcons.fileText,
                  actionLabel: 'Làm mới',
                  onAction: qc.loadMyQuotes,
                );
              }
              return RefreshIndicator(
                onRefresh: qc.loadMyQuotes,
                child: ListView.separated(
                  padding: const EdgeInsets.all(AppSpacing.sm),
                  itemCount: qc.myQuotes.length,
                  separatorBuilder: (_, __) =>
                      const SizedBox(height: AppSpacing.xs),
                  itemBuilder: (context, i) {
                    final q = qc.myQuotes[i];
                    final id = _quoteId(q);
                    final price = q['price'];
                    final priceStr = price is num
                        ? '${money.format(price.toInt())} đ'
                        : (price?.toString() ?? '—');
                    final status = (q['status'] ?? q['state'] ?? '').toString();
                    final info = statusInfo(status);
                    final desc = stringField(q, ['description', 'message', 'title']);

                    return AppListCard(
                      leading: CircleAvatar(
                        backgroundColor: scheme.primaryContainer,
                        child: Icon(
                          LucideIcons.fileText,
                          color: scheme.primary,
                          size: 18,
                        ),
                      ),
                      title: priceStr,
                      subtitle: desc.isEmpty ? null : desc,
                      trailing: AppStatusBadge(
                        label: info.label,
                        tone: info.tone,
                        dense: true,
                      ),
                      footer: _QuoteActions(
                        quote: q,
                        quoteId: id,
                        onAfterAction: qc.loadMyQuotes,
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

class _QuoteActions extends StatelessWidget {
  const _QuoteActions({
    required this.quote,
    required this.quoteId,
    required this.onAfterAction,
  });

  final Map<String, dynamic> quote;
  final String quoteId;
  final Future<void> Function() onAfterAction;

  @override
  Widget build(BuildContext context) {
    final qc = Get.find<QuoteController>();
    final st = (quote['status'] ?? quote['state'] ?? '').toString().toLowerCase();
    final entries = <_QuoteAction>[];

    if (st == 'order_requested') {
      entries.add(
        _QuoteAction(
          icon: Icons.check_circle_outline,
          label: 'Xác nhận đơn',
          onTap: () async {
            await Get.find<OrderController>().confirmFromQuote(quoteId);
            await onAfterAction();
          },
        ),
      );
    }
    if (st == 'accepted_for_chat' || st == 'revising') {
      entries.add(
        _QuoteAction(
          icon: Icons.replay,
          label: 'Chào lại',
          onTap: () => _revise(context, qc, quoteId, onAfterAction),
        ),
      );
    }
    if (st == 'pending') {
      entries.add(
        _QuoteAction(
          icon: Icons.edit_outlined,
          label: 'Sửa',
          onTap: () => _edit(context, qc, quoteId, quote, onAfterAction),
        ),
      );
    }
    entries.add(
      _QuoteAction(
        icon: Icons.cancel_outlined,
        label: 'Hủy',
        onTap: () async {
          await qc.cancelQuoteById(quoteId);
          await onAfterAction();
        },
      ),
    );
    entries.add(
      _QuoteAction(
        icon: Icons.delete_outline,
        label: 'Xóa',
        danger: true,
        onTap: () async {
          await qc.deleteQuoteById(quoteId);
          await onAfterAction();
        },
      ),
    );

    return Wrap(
      spacing: AppSpacing.xs,
      runSpacing: 4,
      children: [
        for (final e in entries)
          TextButton.icon(
            style: TextButton.styleFrom(
              foregroundColor: e.danger
                  ? Theme.of(context).colorScheme.error
                  : Theme.of(context).colorScheme.primary,
              padding: const EdgeInsets.symmetric(horizontal: 8),
            ),
            onPressed: quoteId.isEmpty ? null : e.onTap,
            icon: Icon(e.icon, size: 16),
            label: Text(e.label),
          ),
      ],
    );
  }

  Future<void> _revise(
    BuildContext context,
    QuoteController qc,
    String id,
    Future<void> Function() reload,
  ) async {
    final priceCtrl =
        TextEditingController(text: quote['price']?.toString() ?? '');
    final reasonCtrl = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadii.lg),
        ),
        title: const Text('Chào giá lại'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: priceCtrl,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Giá mới *'),
            ),
            const SizedBox(height: AppSpacing.xs),
            TextField(
              controller: reasonCtrl,
              decoration: const InputDecoration(labelText: 'Lý do thay đổi'),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Hủy'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Gửi'),
          ),
        ],
      ),
    );
    if (ok == true && context.mounted) {
      final p = num.tryParse(priceCtrl.text.trim());
      if (p == null) {
        Get.snackbar('Lỗi', 'Giá không hợp lệ');
        return;
      }
      await qc.reviseQuote(
        id,
        price: p,
        changeReason:
            reasonCtrl.text.trim().isEmpty ? null : reasonCtrl.text.trim(),
      );
      await reload();
    }
  }

  Future<void> _edit(
    BuildContext context,
    QuoteController qc,
    String id,
    Map<String, dynamic> q,
    Future<void> Function() reload,
  ) async {
    final priceCtrl = TextEditingController(text: q['price']?.toString() ?? '');
    final descCtrl =
        TextEditingController(text: q['description']?.toString() ?? '');
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadii.lg),
        ),
        title: const Text('Sửa báo giá'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: priceCtrl,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Giá'),
            ),
            const SizedBox(height: AppSpacing.xs),
            TextField(
              controller: descCtrl,
              maxLines: 3,
              decoration: const InputDecoration(labelText: 'Mô tả'),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Hủy'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Lưu'),
          ),
        ],
      ),
    );
    if (ok == true && context.mounted) {
      final dto = UpdateQuoteDto(
        (b) => b
          ..price = num.tryParse(priceCtrl.text.trim())
          ..description =
              descCtrl.text.trim().isEmpty ? null : descCtrl.text.trim(),
      );
      await qc.updateQuote(id, dto);
      await reload();
    }
  }
}

class _QuoteAction {
  const _QuoteAction({
    required this.icon,
    required this.label,
    required this.onTap,
    this.danger = false,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final bool danger;
}
