import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:mobile_app_doan/core/theme/app_spacing.dart';
import 'package:mobile_app_doan/core/widgets/app_empty_state.dart';
import 'package:mobile_app_doan/core/widgets/app_list_skeleton.dart';
import 'package:mobile_app_doan/core/widgets/app_page_header.dart';
import 'package:mobile_app_doan/core/widgets/app_primary_button.dart';
import 'package:mobile_app_doan/core/widgets/app_status_badge.dart';
import 'package:mobile_app_doan/home/controllers/certification_controller.dart';
import 'package:url_launcher/url_launcher.dart';

class CertificationsPage extends StatefulWidget {
  const CertificationsPage({super.key});

  @override
  State<CertificationsPage> createState() => _CertificationsPageState();
}

class _CertificationsPageState extends State<CertificationsPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Get.find<CertificationController>().loadMyCertifications();
    });
  }

  @override
  Widget build(BuildContext context) {
    final cc = Get.find<CertificationController>();
    final scheme = Theme.of(context).colorScheme;
    return Scaffold(
      backgroundColor: scheme.surfaceContainerLowest,
      body: Column(
        children: [
          AppPageHeader(
            title: 'Chứng chỉ của tôi',
            subtitle: 'Xác minh năng lực để khách hàng tin tưởng hơn',
            trailing: [
              IconButton(
                tooltip: 'Làm mới',
                icon: const Icon(Icons.refresh, color: Colors.white),
                onPressed: cc.loadMyCertifications,
              ),
            ],
          ),
          Expanded(
            child: Obx(() {
              if (cc.isLoading.value && cc.certifications.isEmpty) {
                return const AppListSkeleton(itemCount: 3);
              }
              if (cc.certifications.isEmpty) {
                return AppEmptyState(
                  title: 'Chưa có chứng chỉ',
                  subtitle:
                      'Tải lên chứng chỉ hành nghề để khách hàng tin tưởng hơn.',
                  icon: Icons.verified_outlined,
                  actionLabel: 'Tải lên',
                  onAction: () => _showUploadDialog(context),
                );
              }
              return ListView.separated(
                padding: const EdgeInsets.all(AppSpacing.sm),
                itemCount: cc.certifications.length,
                separatorBuilder: (_, __) =>
                    const SizedBox(height: AppSpacing.xs),
                itemBuilder: (ctx, i) => _CertCard(cert: cc.certifications[i]),
              );
            }),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showUploadDialog(context),
        icon: const Icon(Icons.upload_file),
        label: const Text('Tải lên'),
      ),
    );
  }

  void _showUploadDialog(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (_) => const _UploadCertSheet(),
    );
  }
}

class _CertCard extends StatelessWidget {
  const _CertCard({required this.cert});
  final Map<String, dynamic> cert;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final status = cert['verificationStatus']?.toString() ?? 'pending';
    final isExpired = cert['isExpired'] == true;

    final (badgeLabel, badgeTone, statusIcon) = switch (status) {
      'verified' => (
          'Đã duyệt',
          AppStatusTone.success,
          Icons.verified,
        ),
      'rejected' => (
          'Từ chối',
          AppStatusTone.danger,
          Icons.cancel,
        ),
      _ => (
          'Đang xét duyệt',
          AppStatusTone.warning,
          Icons.hourglass_top,
        ),
    };
    final statusColor = switch (status) {
      'verified' => Colors.green,
      'rejected' => Colors.red,
      _ => Colors.orange,
    };

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.sm),
        child: Row(
          children: [
            CircleAvatar(
              backgroundColor: statusColor.withValues(alpha: 0.15),
              child: Icon(statusIcon, color: statusColor, size: 24),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    cert['title']?.toString() ?? '',
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                  if ((cert['issuingOrganization'] ?? '').toString().isNotEmpty)
                    Text(cert['issuingOrganization'].toString(),
                        style: Theme.of(context).textTheme.bodySmall),
                  Row(
                    children: [
                      AppStatusBadge(
                        label: badgeLabel,
                        tone: badgeTone,
                        dense: true,
                      ),
                      if (isExpired) ...[
                        const SizedBox(width: 6),
                        const AppStatusBadge(
                          label: 'Hết hạn',
                          tone: AppStatusTone.danger,
                          dense: true,
                        ),
                      ],
                    ],
                  ),
                  if ((cert['rejectionReason'] ?? '').toString().isNotEmpty)
                    Text(
                      'Lý do: ${cert['rejectionReason']}',
                      style: TextStyle(color: scheme.error, fontSize: 12),
                    ),
                ],
              ),
            ),
            Column(
              children: [
                if ((cert['fileUrl'] ?? '').toString().isNotEmpty)
                  IconButton(
                    icon: const Icon(Icons.open_in_new, size: 20),
                    tooltip: 'Xem PDF',
                    onPressed: () async {
                      final url = Uri.tryParse(cert['fileUrl'].toString());
                      if (url != null && await canLaunchUrl(url)) {
                        await launchUrl(url, mode: LaunchMode.externalApplication);
                      }
                    },
                  ),
                IconButton(
                  icon: const Icon(Icons.delete_outline, size: 20, color: Colors.red),
                  tooltip: 'Xóa',
                  onPressed: () async {
                    final id = cert['id']?.toString() ?? '';
                    if (id.isEmpty) return;
                    final ok = await showDialog<bool>(
                      context: context,
                      builder: (ctx) => AlertDialog(
                        title: const Text('Xóa chứng chỉ?'),
                        content: const Text('Hành động này không thể hoàn tác.'),
                        actions: [
                          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Hủy')),
                          FilledButton(
                            style: FilledButton.styleFrom(backgroundColor: Colors.red),
                            onPressed: () => Navigator.pop(ctx, true),
                            child: const Text('Xóa'),
                          ),
                        ],
                      ),
                    );
                    if (ok == true) {
                      await Get.find<CertificationController>().deleteCertification(id);
                    }
                  },
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _UploadCertSheet extends StatefulWidget {
  const _UploadCertSheet();

  @override
  State<_UploadCertSheet> createState() => _UploadCertSheetState();
}

class _UploadCertSheetState extends State<_UploadCertSheet> {
  final _title = TextEditingController();
  final _org = TextEditingController();
  DateTime? _issueDate;
  DateTime? _expiryDate;
  PlatformFile? _selectedFile;
  bool _busy = false;

  @override
  void dispose() {
    _title.dispose();
    _org.dispose();
    super.dispose();
  }

  Future<void> _pickFile() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf'],
      withData: true,
    );
    if (result != null && result.files.isNotEmpty) {
      setState(() => _selectedFile = result.files.first);
    }
  }

  Future<void> _pickDate(bool isIssue) async {
    final initial = isIssue
        ? (_issueDate ?? DateTime(2020))
        : (_expiryDate ?? DateTime.now().add(const Duration(days: 365)));
    final picked = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: DateTime(2000),
      lastDate: DateTime(2040),
    );
    if (picked != null) {
      setState(() {
        if (isIssue) {
          _issueDate = picked;
        } else {
          _expiryDate = picked;
        }
      });
    }
  }

  Future<void> _upload() async {
    if (_title.text.trim().isEmpty) {
      Get.snackbar('Lỗi', 'Vui lòng nhập tên chứng chỉ');
      return;
    }
    if (_selectedFile == null || _selectedFile!.bytes == null) {
      Get.snackbar('Lỗi', 'Vui lòng chọn file PDF');
      return;
    }
    setState(() => _busy = true);

    final fmt = DateFormat('yyyy-MM-dd');
    final ok = await Get.find<CertificationController>().uploadCertification(
      fileBytes: _selectedFile!.bytes!,
      fileName: _selectedFile!.name,
      title: _title.text.trim(),
      issuingOrganization: _org.text.trim().isEmpty ? null : _org.text.trim(),
      issueDate: _issueDate != null ? fmt.format(_issueDate!) : null,
      expiryDate: _expiryDate != null ? fmt.format(_expiryDate!) : null,
    );

    if (mounted) {
      setState(() => _busy = false);
      if (ok) Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final fmt = DateFormat('dd/MM/yyyy');
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
            Text('Tải lên chứng chỉ', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 16),
            TextField(
              controller: _title,
              decoration: const InputDecoration(
                labelText: 'Tên chứng chỉ *',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _org,
              decoration: const InputDecoration(
                labelText: 'Đơn vị cấp',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _pickDate(true),
                    icon: const Icon(Icons.calendar_today, size: 16),
                    label: Text(_issueDate != null ? fmt.format(_issueDate!) : 'Ngày cấp'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _pickDate(false),
                    icon: const Icon(Icons.event_busy, size: 16),
                    label: Text(_expiryDate != null ? fmt.format(_expiryDate!) : 'Hết hạn'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: _pickFile,
              icon: const Icon(Icons.upload_file),
              label: Text(_selectedFile != null ? _selectedFile!.name : 'Chọn file PDF (tối đa 10MB)'),
            ),
            const SizedBox(height: 16),
            AppPrimaryButton(
              label: _busy ? 'Đang tải...' : 'Tải lên',
              isLoading: _busy,
              onPressed: _busy ? null : _upload,
            ),          ],
        ),
      ),
    );
  }
}
