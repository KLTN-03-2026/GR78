// File: customer_profile_tab.dart
// Flutter implementation of CustomerProfileTab (fixed Future<UserModel> issue)

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile_app_doan/core/theme/app_colors.dart';
import 'package:mobile_app_doan/core/widgets/app_empty_state.dart';
import 'package:mobile_app_doan/core/widgets/app_error_state.dart';
import 'package:mobile_app_doan/features/auth/controllers/auth_controller.dart';
import 'package:mobile_app_doan/features/auth/widgets/button.dart';
import 'package:mobile_app_doan/home/controllers/post_controller.dart';
import 'package:mobile_app_doan/home/controllers/user_controller.dart';
import 'package:mobile_app_doan/home/widgets/article.dart';
import 'package:mobile_app_doan/home/widgets/dialog/dialog_edit_post.dart';
import 'package:mobile_app_doan/home/widgets/dialog/edit_profile_dialog.dart';
import 'package:mobile_app_doan/home/widgets/post_quotes_sheet.dart';
import 'package:mobile_app_doan/utils/network_image_url.dart';
import 'package:openapi/openapi.dart';

class CustomerProfileTab extends StatefulWidget {
  const CustomerProfileTab({super.key});

  @override
  State<CustomerProfileTab> createState() => _CustomerProfileTabState();
}

class _CustomerProfileTabState extends State<CustomerProfileTab> {
  String activeContentTab = 'posts'; // posts, info

  @override
  void initState() {
    super.initState();
    Get.find<ProfileController>().loadProfile();
  }

  @override
  Widget build(BuildContext context) {
    final profileController = Get.find<ProfileController>();

    return Obx(() {
      if (profileController.isLoading.value) {
        return const Scaffold(
          body: Center(child: CircularProgressIndicator()),
        );
      }

      final profile = profileController.profile.value;

      if (profile == null) {
        return Scaffold(
          body: AppErrorState(
            message: 'Không tải được thông tin người dùng',
            onRetry: () => profileController.loadProfile(),
          ),
        );
      }

      return _buildProfileUI(profile); // Viết hàm này ở dưới
    });
  }

  Widget _buildProfileUI(ProfileResponseDto profile) {
    final avatarForNetwork = profile.avatarUrl;
    final showAvatarNetwork = isHttpImageUrl(avatarForNetwork);

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surfaceContainerLowest,
      body: SafeArea(
        child: Column(
          children: [
            // Cover
            Container(
              height: 80,
              decoration: const BoxDecoration(gradient: AppColors.brandGradient),
            ),

            // Profile card
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Container(
                transform: Matrix4.translationValues(0, -40, 0),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surface,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.06),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 44,
                      backgroundImage: showAvatarNetwork
                          ? NetworkImage(avatarForNetwork!)
                          : null,
                      backgroundColor: Theme.of(context).colorScheme.primary,
                      child: !showAvatarNetwork
                          ? Text(
                              profile.displayName != null &&
                                      profile.displayName!.isNotEmpty
                                  ? profile.displayName![0]
                                  : "?",
                              style: const TextStyle(
                                fontSize: 36,
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            )
                          : null,
                    ),
                    const SizedBox(height: 12),

                    Text(
                      profile.displayName ?? "No name",
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _statItem("7", "Bài đăng"),
                        SizedBox(width: 100),
                        _statItem("8", "Đã đánh giá"),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      alignment: WrapAlignment.center,
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        OutlinedButton.icon(
                          onPressed: () => Get.toNamed('/orders'),
                          icon: const Icon(Icons.receipt_long, size: 18),
                          label: const Text('Đơn hàng'),
                        ),
                        if (profile.role == UserRole.provider)
                          OutlinedButton.icon(
                            onPressed: () => Get.toNamed('/saved-posts'),
                            icon: const Icon(Icons.bookmark_outline, size: 18),
                            label: const Text('Đã lưu'),
                          ),
                      ],
                    ),

                    Padding(
                      padding: const EdgeInsets.all(30),
                      child: PrimaryButton(
                        text: "Chỉnh sửa thông tin",
                        onPressed: () async {
                          Get.dialog(
                            EditProfileDialog(
                              user: profile,
                              onUpdated: () {
                                Get.find<ProfileController>().loadProfile();
                              },
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Tab buttons
            Container(
              color: Theme.of(context).colorScheme.surface,
              child: Row(
                children: [
                  Expanded(
                    child: _tabButton(
                      'posts',
                      'Bài đăng',
                      activeContentTab == 'posts',
                      () {
                        setState(() => activeContentTab = 'posts');
                        Get.find<PostController>().loadMyPosts();
                      },
                    ),
                  ),
                  Expanded(
                    child: _tabButton(
                      'info',
                      'Thông tin',
                      activeContentTab == 'info',
                      () => setState(() => activeContentTab = 'info'),
                    ),
                  ),
                ],
              ),
            ),

            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: activeContentTab == 'posts'
                    ? _buildCustomerPosts()
                    : _buildCustomerInfoFromApi(profile),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCustomerPosts() {
    final controller = Get.find<PostController>();

    return Obx(() {
      if (controller.isLoading.value) {
        return const Center(child: CircularProgressIndicator());
      }

      if (controller.posts.isEmpty) {
        return const AppEmptyState(
          title: 'Bạn chưa có bài đăng nào',
          subtitle: 'Đăng yêu cầu để thợ có thể báo giá.',
          icon: Icons.post_add_outlined,
        );
      }

      return ListView.separated(
        itemCount: controller.myPosts.length,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final post = controller.myPosts[index];
          return Article(
            postResponseDto: post,
            isSaved: false,
            onSave: () {},
            onbid: null,
            onViewQuotes: () => showPostQuotesSheet(context, post.id),
            onEdit: () => UpdatePostDialog.show(context, post: post),
            onDelete: () => _confirmDeletePost(controller, post),
          );
        },
      );
    });
  }

  Widget _buildCustomerInfoFromApi(ProfileResponseDto profile) {
    return ListView(
      children: [
        _infoTile(Icons.alternate_email, "Tên hiển thị",
            profile.displayName ?? "Chưa cập nhật"),
        _infoTile(Icons.email, "Email", profile.email ?? ""),
        _infoTile(Icons.phone, "Số điện thoại", profile.phone ?? ""),
        _infoTile(Icons.badge, "Vai trò", profile.role.toString()),
        _infoTile(
          Icons.location_on,
          "Địa chỉ",
          profile.address ?? "Chưa cập nhật",
        ),
        const SizedBox(height: 24),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8),
          child: OutlinedButton.icon(
            onPressed: () => _confirmDeleteAccount(context),
            icon: const Icon(Icons.delete_forever, color: Colors.red),
            label: const Text(
              'Xóa tài khoản',
              style: TextStyle(color: Colors.red),
            ),
          ),
        ),
      ],
    );
  }

  Future<void> _confirmDeleteAccount(BuildContext context) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Xóa tài khoản'),
        content: const Text(
          'Tài khoản sẽ bị vô hiệu hóa (có thể khôi phục trong 30 ngày theo server). Tiếp tục?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Hủy'),
          ),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Xóa'),
          ),
        ],
      ),
    );
    if (ok != true || !context.mounted) return;

    final profileController = Get.find<ProfileController>();
    final res = await profileController.deleteAccount();
    if (!context.mounted) return;

    if (res != null) {
      Get.snackbar('Đã xóa tài khoản', res.message);
      await Get.find<AuthController>().logout();
    } else {
      Get.snackbar('Lỗi', profileController.errorMessage.value);
    }
  }

  Widget _infoTile(IconData icon, String title, String subtitle) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
            CircleAvatar(
            backgroundColor: Theme.of(context).colorScheme.primaryContainer,
            child: Icon(icon, color: Theme.of(context).colorScheme.primary),
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: Theme.of(context).textTheme.bodySmall,
              ),
              Text(
                subtitle,
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _statItem(String value, String label) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall,
        ),
      ],
    );
  }

  Widget _tabButton(String key, String label, bool active, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(
              color: active ? AppColors.seed : Colors.transparent,
              width: 2,
            ),
          ),
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              color: active
                  ? AppColors.seed
                  : Theme.of(context).colorScheme.onSurfaceVariant,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _confirmDeletePost(
    PostController controller,
    PostResponseDto post,
  ) async {
    final shouldDelete = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Xóa bài viết'),
        content: const Text('Bạn có chắc chắn muốn xóa bài viết này?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Hủy'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: FilledButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Xóa'),
          ),
        ],
      ),
    );

    if (shouldDelete == true) {
      await controller.deletePost(post.id);
    }
  }
}
