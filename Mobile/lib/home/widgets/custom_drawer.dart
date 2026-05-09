import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile_app_doan/core/theme/app_colors.dart';
import 'package:mobile_app_doan/core/theme/app_radii.dart';
import 'package:mobile_app_doan/core/theme/app_spacing.dart';
import 'package:mobile_app_doan/core/user_role_context.dart';
import 'package:mobile_app_doan/core/widgets/app_section_label.dart';
import 'package:mobile_app_doan/features/auth/controllers/auth_controller.dart';
import 'package:mobile_app_doan/home/controllers/user_controller.dart';

class CustomDrawer extends StatelessWidget {
  const CustomDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Drawer(
      backgroundColor: scheme.surface,
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.sm,
            vertical: AppSpacing.xs,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Menu',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.w800,
                          letterSpacing: -0.2,
                        ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.sm),
              Obx(() {
                final auth = Get.find<AuthController>();
                auth.userRole.value;
                final name = auth.userName.value.isEmpty
                    ? 'Người dùng'
                    : auth.userName.value;
                return Container(
                  padding: const EdgeInsets.all(AppSpacing.sm),
                  decoration: BoxDecoration(
                    color: scheme.surfaceContainerHighest.withValues(alpha: 0.45),
                    borderRadius: BorderRadius.circular(AppRadii.lg),
                    border: Border.all(
                      color: scheme.outlineVariant.withValues(alpha: 0.35),
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(2),
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: AppColors.brandGradient,
                        ),
                        child: CircleAvatar(
                          radius: 22,
                          backgroundColor: scheme.surface,
                          child: Icon(
                            Icons.person,
                            color: scheme.primary,
                            size: 26,
                          ),
                        ),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              name,
                              style: const TextStyle(
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            Text(
                              auth.userEmail.value.isEmpty
                                  ? 'Xem trang cá nhân'
                                  : auth.userEmail.value,
                              style: TextStyle(
                                color: scheme.onSurfaceVariant,
                                fontSize: 13,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            if (auth.userRole.value.isNotEmpty) ...[
                              const SizedBox(height: 6),
                              Align(
                                alignment: Alignment.centerLeft,
                                child: _RoleChip(
                                  label: currentUserIsProvider()
                                      ? 'Nhà cung cấp (provider)'
                                      : currentUserIsAdmin()
                                          ? 'Quản trị (admin)'
                                          : currentUserIsCustomer()
                                              ? 'Khách hàng (customer)'
                                              : (auth.userRole.value.isEmpty
                                                  ? 'Vai trò'
                                                  : auth.userRole.value),
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              }),
              const SizedBox(height: AppSpacing.sm),
              Expanded(
                child: Obx(() {
                  Get.find<AuthController>().userRole.value;
                  if (Get.isRegistered<ProfileController>()) {
                    Get.find<ProfileController>().profile.value;
                  }
                  final isProv = currentUserIsProvider();
                  final isCust = currentUserIsCustomer();
                  final isAdmin = currentUserIsAdmin();
                  final showProviderNav = isProv || isAdmin;
                  final showCustomerNav = isCust || isAdmin;

                  return ListView(
                    padding: EdgeInsets.zero,
                    children: [
                      AppSectionLabel(
                        'Điều hướng',
                        padding: const EdgeInsets.only(
                          left: AppSpacing.xxs,
                          bottom: AppSpacing.xs,
                        ),
                      ),
                      _drawerItem(context, Icons.home_outlined, 'Trang chủ', () {
                        Navigator.pop(context);
                      }),
                      if (showCustomerNav) ...[
                        _drawerItem(
                          context,
                          Icons.history,
                          'Lịch sử yêu cầu',
                          () {
                            Navigator.pop(context);
                            Get.toNamed<void>('/custom-requests');
                          },
                        ),
                        _drawerItem(
                          context,
                          Icons.favorite_border,
                          'Thợ yêu thích',
                          () {
                            Navigator.pop(context);
                            Get.toNamed<void>('/favorite-workers');
                          },
                        ),
                      ],
                      if (showProviderNav) ...[
                        _drawerItem(
                          context,
                          Icons.bookmark_border,
                          'Đã lưu (thợ)',
                          () {
                            Navigator.pop(context);
                            Get.toNamed('/saved-posts');
                          },
                        ),
                        _drawerItem(
                          context,
                          Icons.request_quote,
                          'Báo giá đã gửi',
                          () {
                            Navigator.pop(context);
                            Get.toNamed('/my-quotes');
                          },
                        ),
                      ],
                      _drawerItem(context, Icons.receipt_long, 'Đơn hàng', () {
                        Navigator.pop(context);
                        Get.toNamed('/orders');
                      }),
                      _drawerItem(
                        context,
                        Icons.send_and_archive_outlined,
                        'Yêu cầu riêng',
                        () {
                          Navigator.pop(context);
                          Get.toNamed('/custom-requests');
                        },
                      ),
                      _drawerItem(context, Icons.settings_outlined, 'Cài đặt', () {
                        Navigator.pop(context);
                        Get.toNamed<void>('/settings');
                      }),
                      _drawerItem(context, Icons.api, 'API Console', () {
                        Navigator.pop(context);
                        Get.toNamed('/api');
                      }),
                      const SizedBox(height: AppSpacing.sm),
                      AppSectionLabel(
                        'Tài khoản',
                        padding: const EdgeInsets.only(
                          left: AppSpacing.xxs,
                          bottom: AppSpacing.xs,
                        ),
                      ),
                    _drawerItem(context, Icons.devices, 'Đăng xuất mọi thiết bị',
                        () async {
                      Navigator.pop(context);
                      final confirm = await Get.dialog<bool>(
                        AlertDialog(
                          title: const Text('Xác nhận'),
                          content: const Text(
                            'Đăng xuất tất cả thiết bị đang đăng nhập tài khoản này?',
                          ),
                          actions: [
                            TextButton(
                              onPressed: () => Get.back(result: false),
                              child: const Text('Hủy'),
                            ),
                            FilledButton(
                              onPressed: () => Get.back(result: true),
                              style: FilledButton.styleFrom(
                                backgroundColor: Colors.orange,
                              ),
                              child: const Text('Đăng xuất hết'),
                            ),
                          ],
                        ),
                        barrierDismissible: false,
                      );
                      if (confirm == true) {
                        Get.dialog(
                          const PopScope(
                            canPop: false,
                            child: Center(child: CircularProgressIndicator()),
                          ),
                          barrierDismissible: false,
                        );
                        try {
                          await Get.find<AuthController>().logoutAllDevices();
                        } finally {
                          if (Get.isDialogOpen ?? false) Get.back();
                        }
                      }
                    }),
                    _drawerItem(context, Icons.logout, 'Đăng xuất', () async {
                      Navigator.pop(context);

                      final confirm = await Get.dialog<bool>(
                        AlertDialog(
                          title: const Text('Xác nhận'),
                          content: const Text('Bạn có chắc muốn đăng xuất?'),
                          actions: [
                            TextButton(
                              onPressed: () => Get.back(result: false),
                              child: const Text('Hủy'),
                            ),
                            FilledButton(
                              onPressed: () => Get.back(result: true),
                              style: FilledButton.styleFrom(
                                backgroundColor:
                                    Theme.of(context).colorScheme.error,
                              ),
                              child: const Text('Đăng xuất'),
                            ),
                          ],
                        ),
                        barrierDismissible: false,
                      );

                      if (confirm == true) {
                        Get.dialog(
                          const PopScope(
                            canPop: false,
                            child: Center(child: CircularProgressIndicator()),
                          ),
                          barrierDismissible: false,
                        );

                        try {
                          await Get.find<AuthController>().logout();
                        } catch (e) {
                          debugPrint('Drawer logout error: $e');
                        } finally {
                          if (Get.isDialogOpen ?? false) {
                            Get.back();
                          }
                        }
                      }
                    }),
                  ],
                );
                }),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _drawerItem(
    BuildContext context,
    IconData icon,
    String text,
    VoidCallback onTap,
  ) {
    final scheme = Theme.of(context).colorScheme;
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: AppSpacing.xs),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadii.md),
      ),
      leading: Icon(icon, color: scheme.onSurfaceVariant),
      title: Text(
        text,
        style: const TextStyle(fontWeight: FontWeight.w500),
      ),
      trailing: Icon(
        Icons.chevron_right,
        size: 20,
        color: scheme.onSurfaceVariant.withValues(alpha: 0.7),
      ),
      onTap: onTap,
    );
  }
}

class _RoleChip extends StatelessWidget {
  const _RoleChip({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: scheme.primaryContainer.withValues(alpha: 0.65),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: scheme.onPrimaryContainer,
              fontWeight: FontWeight.w600,
            ),
      ),
    );
  }
}
