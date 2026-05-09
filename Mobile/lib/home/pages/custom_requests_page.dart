import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile_app_doan/core/theme/app_spacing.dart';
import 'package:mobile_app_doan/core/widgets/app_empty_state.dart';
import 'package:mobile_app_doan/core/widgets/app_list_skeleton.dart';
import 'package:mobile_app_doan/core/widgets/app_page_header.dart';
import 'package:mobile_app_doan/home/controllers/custom_request_controller.dart';
import 'package:mobile_app_doan/home/controllers/user_controller.dart';

class CustomRequestsPage extends StatefulWidget {
  const CustomRequestsPage({super.key});

  @override
  State<CustomRequestsPage> createState() => _CustomRequestsPageState();
}

class _CustomRequestsPageState extends State<CustomRequestsPage>
    with SingleTickerProviderStateMixin {
  late final TabController _tabs;
  String? _role;

  @override
  void initState() {
    super.initState();
    _role = Get.find<ProfileController>().profile.value?.role.name;
    final isProvider = _role == 'provider';
    _tabs = TabController(length: isProvider ? 2 : 1, vsync: this);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final cr = Get.find<CustomRequestController>();
      cr.loadSentRequests();
      if (isProvider) cr.loadReceivedRequests();
    });
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  bool get _isProvider => _role == 'provider';

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Scaffold(
      backgroundColor: scheme.surfaceContainerLowest,
      body: Column(
        children: [
          AppPageHeader(
            title: 'Yêu cầu riêng',
            subtitle: 'Gửi hoặc nhận yêu cầu trực tiếp giữa khách và thợ',
          ),
          if (_isProvider)
            Material(
              color: scheme.primary,
              child: TabBar(
                controller: _tabs,
                labelColor: scheme.onPrimary,
                unselectedLabelColor: scheme.onPrimary.withValues(alpha: 0.75),
                indicatorColor: scheme.onPrimary,
                indicatorWeight: 3,
                tabs: const [
                  Tab(text: 'Đã gửi'),
                  Tab(text: 'Nhận được'),
                ],
              ),
            ),
          Expanded(
            child: _isProvider
                ? TabBarView(
                    controller: _tabs,
                    children: const [
                      _SentRequestsTab(),
                      _ReceivedRequestsTab(),
                    ],
                  )
                : const _SentRequestsTab(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showCreateDialog(context),
        icon: const Icon(Icons.add),
        label: const Text('Gửi yêu cầu'),
      ),
    );
  }

  void _showCreateDialog(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (_) => const CreateCustomRequestSheet(),
    );
  }
}

class _SentRequestsTab extends StatelessWidget {
  const _SentRequestsTab();

  @override
  Widget build(BuildContext context) {
    final cr = Get.find<CustomRequestController>();
    return Obx(() {
      if (cr.isLoading.value && cr.sentRequests.isEmpty) {
        return const AppListSkeleton(itemCount: 3);
      }
      if (cr.sentRequests.isEmpty) {
        return AppEmptyState(
          title: 'Chưa có yêu cầu nào',
          subtitle: 'Gửi yêu cầu riêng tới thợ để nhận báo giá nhanh hơn.',
          icon: Icons.send_outlined,
          actionLabel: 'Làm mới',
          onAction: cr.loadSentRequests,
        );
      }
      return RefreshIndicator(
        onRefresh: cr.loadSentRequests,
        child: ListView.separated(
          padding: const EdgeInsets.all(AppSpacing.sm),
          itemCount: cr.sentRequests.length,
          separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.xs),
          itemBuilder: (ctx, i) =>
              _CustomRequestCard(req: cr.sentRequests[i], isSender: true),
        ),
      );
    });
  }
}

class _ReceivedRequestsTab extends StatelessWidget {
  const _ReceivedRequestsTab();

  @override
  Widget build(BuildContext context) {
    final cr = Get.find<CustomRequestController>();
    return Obx(() {
      if (cr.isLoading.value && cr.receivedRequests.isEmpty) {
        return const AppListSkeleton(itemCount: 3);
      }
      if (cr.receivedRequests.isEmpty) {
        return AppEmptyState(
          title: 'Chưa có yêu cầu riêng',
          subtitle: 'Khách hàng có thể gửi yêu cầu trực tiếp cho bạn.',
          icon: Icons.inbox_outlined,
          actionLabel: 'Làm mới',
          onAction: cr.loadReceivedRequests,
        );
      }
      return RefreshIndicator(
        onRefresh: cr.loadReceivedRequests,
        child: ListView.separated(
          padding: const EdgeInsets.all(AppSpacing.sm),
          itemCount: cr.receivedRequests.length,
          separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.xs),
          itemBuilder: (ctx, i) =>
              _CustomRequestCard(req: cr.receivedRequests[i], isSender: false),
        ),
      );
    });
  }
}

class _CustomRequestCard extends StatelessWidget {
  const _CustomRequestCard({required this.req, required this.isSender});
  final Map<String, dynamic> req;
  final bool isSender;

  @override
  Widget build(BuildContext context) {
    final status = req['status']?.toString() ?? 'pending';
    final title = req['title']?.toString() ?? 'Yêu cầu';
    final desc = req['description']?.toString() ?? '';
    final budget = req['budget'];

    Color statusColor = switch (status) {
      'accepted' => Colors.green,
      'rejected' => Colors.red,
      'completed' => Colors.blue,
      _ => Colors.orange,
    };

    final statusLabel = switch (status) {
      'accepted' => 'Đã chấp nhận',
      'rejected' => 'Từ chối',
      'completed' => 'Hoàn thành',
      _ => 'Đang chờ',
    };

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.sm),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(statusLabel, style: TextStyle(fontSize: 11, color: statusColor)),
                ),
              ],
            ),
            if (desc.isNotEmpty) ...[
              const SizedBox(height: 6),
              Text(desc, maxLines: 2, overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 13)),
            ],
            if (budget != null) ...[
              const SizedBox(height: 4),
              Text('Ngân sách: $budget đ', style: const TextStyle(fontSize: 12)),
            ],
            if (!isSender && status == 'pending') ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: FilledButton.icon(
                      onPressed: () => _showAcceptDialog(context, req['id']?.toString() ?? ''),
                      icon: const Icon(Icons.check, size: 16),
                      label: const Text('Chấp nhận & Báo giá'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  OutlinedButton(
                    onPressed: () => _reject(context, req['id']?.toString() ?? ''),
                    child: const Text('Từ chối'),
                  ),
                ],
              ),
            ],
            if (isSender && status == 'pending') ...[
              const SizedBox(height: 8),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton.icon(
                  onPressed: () async {
                    final id = req['id']?.toString() ?? '';
                    await Get.find<CustomRequestController>().deleteRequest(id);
                  },
                  icon: const Icon(Icons.delete_outline, size: 16, color: Colors.red),
                  label: const Text('Xóa', style: TextStyle(color: Colors.red)),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  void _showAcceptDialog(BuildContext context, String requestId) {
    final priceCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Chấp nhận & Báo giá'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: priceCtrl,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Giá báo (VND) *'),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: descCtrl,
              maxLines: 3,
              decoration: const InputDecoration(labelText: 'Mô tả công việc *'),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Hủy')),
          FilledButton(
            onPressed: () async {
              final price = double.tryParse(priceCtrl.text.trim());
              if (price == null || descCtrl.text.trim().isEmpty) {
                Get.snackbar('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
                return;
              }
              Navigator.pop(ctx);
              await Get.find<CustomRequestController>().acceptRequest(requestId, {
                'acceptedPrice': price,
                'quoteDescription': descCtrl.text.trim(),
              });
            },
            child: const Text('Gửi báo giá'),
          ),
        ],
      ),
    );
  }

  Future<void> _reject(BuildContext context, String id) async {
    final ctrl = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Từ chối yêu cầu'),
        content: TextField(
          controller: ctrl,
          decoration: const InputDecoration(labelText: 'Lý do (tuỳ chọn)'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Hủy')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Từ chối')),
        ],
      ),
    );
    if (ok == true) {
      await Get.find<CustomRequestController>()
          .rejectRequest(id, reason: ctrl.text.trim().isEmpty ? null : ctrl.text.trim());
    }
  }
}

class CreateCustomRequestSheet extends StatefulWidget {
  const CreateCustomRequestSheet({super.key});

  @override
  State<CreateCustomRequestSheet> createState() => _CreateCustomRequestSheetState();
}

class _CreateCustomRequestSheetState extends State<CreateCustomRequestSheet> {
  final _title = TextEditingController();
  final _desc = TextEditingController();
  final _location = TextEditingController();
  final _budget = TextEditingController();
  final _providerId = TextEditingController();
  bool _busy = false;

  @override
  void dispose() {
    _title.dispose();
    _desc.dispose();
    _location.dispose();
    _budget.dispose();
    _providerId.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_providerId.text.trim().isEmpty) {
      Get.snackbar('Lỗi', 'Vui lòng nhập ID thợ');
      return;
    }
    if (_title.text.trim().isEmpty || _desc.text.trim().isEmpty) {
      Get.snackbar('Lỗi', 'Vui lòng nhập tiêu đề và mô tả');
      return;
    }
    setState(() => _busy = true);
    final body = <String, dynamic>{
      'providerId': _providerId.text.trim(),
      'title': _title.text.trim(),
      'description': _desc.text.trim(),
      if (_location.text.trim().isNotEmpty) 'location': _location.text.trim(),
      if (_budget.text.trim().isNotEmpty)
        'budget': double.tryParse(_budget.text.trim()),
    };
    final ok = await Get.find<CustomRequestController>().createRequest(body);
    if (mounted) {
      setState(() => _busy = false);
      if (ok) Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 20, right: 20, top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Gửi yêu cầu riêng', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 16),
            TextField(
              controller: _providerId,
              decoration: const InputDecoration(
                labelText: 'ID thợ *',
                border: OutlineInputBorder(),
                helperText: 'Lấy từ trang profile của thợ',
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _title,
              decoration: const InputDecoration(
                labelText: 'Tiêu đề *',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _desc,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: 'Mô tả chi tiết *',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _location,
              decoration: const InputDecoration(
                labelText: 'Địa điểm',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _budget,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Ngân sách (VND)',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: _busy ? null : _submit,
              child: Text(_busy ? 'Đang gửi...' : 'Gửi yêu cầu'),
            ),
          ],
        ),
      ),
    );
  }
}
