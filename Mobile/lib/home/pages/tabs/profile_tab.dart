// File: customer_profile_tab.dart
// Flutter implementation of CustomerProfileTab (fixed Future<UserModel> issue)

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile_app_doan/core/theme/app_colors.dart';
import 'package:mobile_app_doan/core/theme/app_radii.dart';
import 'package:mobile_app_doan/core/theme/app_spacing.dart';
import 'package:mobile_app_doan/core/widgets/app_empty_state.dart';
import 'package:mobile_app_doan/core/widgets/app_error_state.dart';
import 'package:mobile_app_doan/features/auth/controllers/auth_controller.dart';
import 'package:mobile_app_doan/features/auth/widgets/button.dart';
import 'package:mobile_app_doan/home/controllers/post_controller.dart';
import 'package:mobile_app_doan/home/controllers/user_controller.dart';
import 'package:mobile_app_doan/home/widgets/article.dart';
import 'package:mobile_app_doan/home/widgets/dialog/dialog_edit_post.dart';
import 'package:mobile_app_doan/home/widgets/dialog/edit_profile_dialog.dart';
import 'package:mobile_app_doan/home/utils/post_author_id.dart';
import 'package:mobile_app_doan/home/utils/profile_navigation.dart';
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
            // Cover + thẻ profile có thể rất cao (nhiều nút provider) — giới hạn chiều cao và cuộn.
            Expanded(
              flex: 2,
              child: SingleChildScrollView(
                clipBehavior: Clip.hardEdge,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Container(
                      height: 96,
                      decoration: const BoxDecoration(
                        gradient: AppColors.brandGradient,
                        borderRadius: BorderRadius.vertical(
                          bottom: Radius.circular(AppRadii.lg),
                        ),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
                      child: Container(
                        transform: Matrix4.translationValues(0, -44, 0),
                        padding: const EdgeInsets.all(AppSpacing.sm),
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.surface,
                          borderRadius: BorderRadius.circular(AppRadii.xl),
                          border: Border.all(
                            color: Theme.of(context).colorScheme.outlineVariant.withValues(alpha: 0.45),
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.07),
                              blurRadius: 16,
                              offset: const Offset(0, 6),
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
                            const SizedBox(height: AppSpacing.xs + 4),
                            Text(
                              profile.displayName ?? 'Chưa đặt tên',
                              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                    fontWeight: FontWeight.w800,
                                    letterSpacing: -0.2,
                                  ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: AppSpacing.xs),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                              children: [
                                _statItem(context, '7', 'Bài đăng'),
                                _statItem(context, '8', 'Đã đánh giá'),
                              ],
                            ),
                            const SizedBox(height: AppSpacing.sm),
                            Wrap(
                              alignment: WrapAlignment.center,
                              spacing: AppSpacing.xs,
                              runSpacing: AppSpacing.xs,
                              children: [
                                OutlinedButton.icon(
                                  onPressed: () => Get.toNamed('/orders'),
                                  icon: const Icon(Icons.receipt_long, size: 18),
                                  label: const Text('Đơn hàng'),
                                ),
                                OutlinedButton.icon(
                                  onPressed: () => Get.toNamed('/custom-requests'),
                                  icon: const Icon(Icons.send_and_archive_outlined, size: 18),
                                  label: const Text('Yêu cầu riêng'),
                                ),
                                OutlinedButton.icon(
                                  onPressed: () => Get.toNamed('/my-reviews'),
                                  icon: const Icon(Icons.star_outline, size: 18),
                                  label: const Text('Đánh giá'),
                                ),
                                if (profile.role == ProfileResponseDtoRoleEnum.provider) ...[
                                  OutlinedButton.icon(
                                    onPressed: () => Get.toNamed('/saved-posts'),
                                    icon: const Icon(Icons.bookmark_outline, size: 18),
                                    label: const Text('Đã lưu'),
                                  ),
                                  OutlinedButton.icon(
                                    onPressed: () => Get.toNamed('/certifications'),
                                    icon: const Icon(Icons.verified_outlined, size: 18),
                                    label: const Text('Chứng chỉ'),
                                  ),
                                  OutlinedButton.icon(
                                    onPressed: () => Get.toNamed('/subscription'),
                                    icon: const Icon(Icons.workspace_premium_outlined, size: 18),
                                    label: const Text('Gói dịch vụ'),
                                  ),
                                  OutlinedButton.icon(
                                    onPressed: () => Get.toNamed('/awaiting-confirmation'),
                                    icon: const Icon(Icons.pending_actions_outlined, size: 18),
                                    label: const Text('Đơn chờ duyệt'),
                                  ),
                                ],
                              ],
                            ),
                            Padding(
                              padding: const EdgeInsets.fromLTRB(
                                AppSpacing.xs,
                                AppSpacing.sm,
                                AppSpacing.xs,
                                0,
                              ),
                              child: PrimaryButton(
                                text: 'Chỉnh sửa thông tin',
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
                    const SizedBox(height: AppSpacing.xs),
                  ],
                ),
              ),
            ),
            Container(
              color: Theme.of(context).colorScheme.surface,
              child: Row(
                children: [
                  Expanded(
                    child: _tabButton(
                      'posts',
                      profile.role == ProfileResponseDtoRoleEnum.provider
                          ? 'Chào giá của tôi'
                          : 'Bài đăng',
                      activeContentTab == 'posts',
                      () {
                        setState(() => activeContentTab = 'posts');
                        if (profile.role != ProfileResponseDtoRoleEnum.provider) {
                          Get.find<PostController>().loadMyPosts();
                        }
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
              flex: 3,
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.sm),
                child: activeContentTab == 'posts'
                    ? (profile.role == ProfileResponseDtoRoleEnum.provider
                        ? _buildProviderQuotes()
                        : _buildCustomerPosts())
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
        separatorBuilder: (_, __) => const SizedBox(height: AppSpacing.sm),
        itemBuilder: (context, index) {
          final post = controller.myPosts[index];
          final authorUserId = postAuthorUserId(post);
          return Article(
            postResponseDto: post,
            isSaved: false,
            onCustomerProfileTap: authorUserId != null
                ? () => navigateToPublicProfile(authorUserId)
                : null,
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

  Widget _buildProviderQuotes() {
    final scheme = Theme.of(context).colorScheme;
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              color: scheme.primaryContainer,
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.request_quote_outlined,
              size: 36,
              color: scheme.primary,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Chào giá đã gửi',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                ),
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            'Xem tất cả các chào giá bạn đã gửi cho khách hàng.',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: scheme.onSurfaceVariant,
                ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: AppSpacing.md),
          FilledButton.icon(
            onPressed: () => Get.toNamed('/my-quotes'),
            icon: const Icon(Icons.open_in_new, size: 18),
            label: const Text('Xem chào giá của tôi'),
          ),
        ],
      ),
    );
  }

  Widget _buildCustomerInfoFromApi(ProfileResponseDto profile) {
    return ListView(
      children: [
        _infoTile(Icons.alternate_email, "Tên hiển thị",
            profile.displayName ?? "Chưa cập nhật"),
        _infoTile(Icons.email, "Email", profile.email ?? ""),
        _infoTile(Icons.phone, "Số điện thoại", profile.phone ?? ""),
        _infoTile(
          Icons.badge,
          'Vai trò',
          profile.role == ProfileResponseDtoRoleEnum.provider
              ? 'Thợ / Nhà cung cấp dịch vụ'
              : profile.role == ProfileResponseDtoRoleEnum.admin
                  ? 'Quản trị viên'
                  : 'Khách hàng',
        ),
        _infoTile(
          Icons.location_on,
          "Địa chỉ",
          profile.address ?? "Chưa cập nhật",
        ),
        const SizedBox(height: AppSpacing.md),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xs),
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
    final scheme = Theme.of(context).colorScheme;
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.xs),
      padding: const EdgeInsets.all(AppSpacing.sm),
      decoration: BoxDecoration(
        color: scheme.surface,
        borderRadius: BorderRadius.circular(AppRadii.md),
        border: Border.all(color: scheme.outlineVariant.withValues(alpha: 0.35)),
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: scheme.primaryContainer,
            child: Icon(icon, color: scheme.primary, size: 22),
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

  Widget _statItem(BuildContext context, String value, String label) {
    final theme = Theme.of(context);
    return Column(
      children: [
        Text(
          value,
          style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
        ),
        const SizedBox(height: AppSpacing.xxs),
        Text(
          label,
          style: theme.textTheme.bodySmall,
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
