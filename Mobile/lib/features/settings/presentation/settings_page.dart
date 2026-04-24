import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile_app_doan/core/theme/app_spacing.dart';
import 'package:mobile_app_doan/core/widgets/app_page_header.dart';
import 'package:mobile_app_doan/features/auth/controllers/auth_controller.dart';

/// Account preferences and app shortcuts — wired where backend exists; toggles are local UX polish.
class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  bool pushNotifications = true;
  bool emailDigest = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      backgroundColor: theme.colorScheme.surfaceContainerLowest,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          AppPageHeader(
            title: 'Cài đặt',
            trailing: [
              IconButton(
                onPressed: () => Get.back<void>(),
                icon: const Icon(Icons.close, color: Colors.white),
              ),
            ],
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(AppSpacing.sm),
              children: [
                _sectionTitle(theme, 'Tài khoản'),
                Obx(() {
                  final auth = Get.find<AuthController>();
                  return Card(
                    child: ListTile(
                      leading: const CircleAvatar(child: Icon(Icons.person_outline)),
                      title: Text(
                        auth.userName.value.isEmpty ? 'Người dùng' : auth.userName.value,
                      ),
                      subtitle: Text(
                        auth.userEmail.value.isEmpty ? '—' : auth.userEmail.value,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  );
                }),
                const SizedBox(height: AppSpacing.md),
                _sectionTitle(theme, 'Thông báo'),
                Card(
                  child: Column(
                    children: [
                      SwitchListTile(
                        title: const Text('Thông báo đẩy'),
                        subtitle: const Text('Nhắc tin nhắn, báo giá, đơn hàng'),
                        value: pushNotifications,
                        onChanged: (v) => setState(() => pushNotifications = v),
                      ),
                      const Divider(height: 1),
                      SwitchListTile(
                        title: const Text('Tóm tắt qua email'),
                        subtitle: const Text('Tuần / tháng (khi server hỗ trợ)'),
                        value: emailDigest,
                        onChanged: (v) => setState(() => emailDigest = v),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                _sectionTitle(theme, 'Ứng dụng'),
                Card(
                  child: Column(
                    children: [
                      ListTile(
                        leading: const Icon(Icons.shield_outlined),
                        title: const Text('Điều khoản & quyền riêng tư'),
                        trailing: const Icon(Icons.open_in_new, size: 18),
                        onTap: () => Get.snackbar(
                          'Thông tin',
                          'Liên kết tài liệu pháp lý sẽ được gắn khi có URL chính thức.',
                        ),
                      ),
                      const Divider(height: 1),
                      ListTile(
                        leading: const Icon(Icons.info_outline),
                        title: const Text('Phiên bản'),
                        subtitle: const Text('1.0.0'),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: AppSpacing.lg),
                FilledButton.tonalIcon(
                  onPressed: () async {
                    final ok = await Get.dialog<bool>(
                      AlertDialog(
                        title: const Text('Đăng xuất'),
                        content: const Text('Bạn có chắc muốn đăng xuất?'),
                        actions: [
                          TextButton(onPressed: () => Get.back(result: false), child: const Text('Hủy')),
                          FilledButton(
                            onPressed: () => Get.back(result: true),
                            child: const Text('Đăng xuất'),
                          ),
                        ],
                      ),
                    );
                    if (ok == true) {
                      await Get.find<AuthController>().logout();
                    }
                  },
                  icon: const Icon(Icons.logout),
                  label: const Text('Đăng xuất'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _sectionTitle(ThemeData theme, String text) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: AppSpacing.xs),
      child: Text(
        text,
        style: theme.textTheme.labelLarge?.copyWith(
          color: theme.colorScheme.primary,
          letterSpacing: 0.2,
        ),
      ),
    );
  }
}
