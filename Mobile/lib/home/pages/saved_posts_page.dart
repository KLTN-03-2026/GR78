import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile_app_doan/core/api_error_message.dart';
import 'package:mobile_app_doan/core/theme/app_spacing.dart';
import 'package:mobile_app_doan/core/widgets/widgets.dart';
import 'package:mobile_app_doan/home/controllers/post_controller.dart';
import 'package:mobile_app_doan/home/controllers/user_controller.dart';
import 'package:mobile_app_doan/home/repo/backend_rest_repository.dart';
import 'package:mobile_app_doan/home/widgets/post_detail_bottom_sheet.dart';
import 'package:openapi/openapi.dart';

/// Bài đã lưu — backend yêu cầu role **provider**.
class SavedPostsPage extends StatefulWidget {
  const SavedPostsPage({super.key});

  @override
  State<SavedPostsPage> createState() => _SavedPostsPageState();
}

class _SavedPostsPageState extends State<SavedPostsPage> {
  final _items = <Map<String, dynamic>>[].obs;
  final _loading = true.obs;
  final _error = ''.obs;
  String? _nextCursor;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load({bool append = false}) async {
    final profile = Get.find<ProfileController>().profile.value;
    if (profile?.role != ProfileResponseDtoRoleEnum.provider) {
      _loading.value = false;
      _error.value = 'Chỉ tài khoản thợ mới xem được mục đã lưu.';
      return;
    }

    _loading.value = !append;
    _error.value = '';
    try {
      final api = Get.find<BackendRestRepository>();
      final raw = await api.listSavedPosts(
        limit: 20,
        cursor: append ? _nextCursor : null,
      );
      Map<String, dynamic>? map;
      if (raw is Map) map = Map<String, dynamic>.from(raw);
      final list = map?['data'];
      final next = map?['nextCursor']?.toString();
      if (list is List) {
        final rows =
            list.whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
        if (append) {
          _items.addAll(rows);
        } else {
          _items.assignAll(rows);
        }
      } else if (!append) {
        _items.clear();
      }
      _nextCursor = next;
    } catch (e) {
      _error.value = describeApiError(e);
      if (!append) _items.clear();
    } finally {
      _loading.value = false;
    }
  }

  Future<void> _unsave(String postId) async {
    try {
      await Get.find<BackendRestRepository>().unsavePost(postId);
      _items.removeWhere((e) => e['postId']?.toString() == postId);
      Get.snackbar('Đã bỏ lưu', '');
    } catch (e) {
      Get.snackbar('Lỗi', describeApiError(e));
    }
  }

  Future<void> _openPostDetail(String postId) async {
    if (postId.isEmpty || !mounted) return;
    showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => const PopScope(
        canPop: false,
        child: Center(child: CircularProgressIndicator()),
      ),
    );
    try {
      final post =
          await Get.find<PostController>().repository.getaPost(postId);
      if (mounted) Navigator.of(context).pop();
      if (mounted) await showPostDetailBottomSheet(context, post);
    } catch (e) {
      if (mounted) Navigator.of(context).pop();
      if (mounted) {
        Get.snackbar('Không tải được chi tiết', describeApiError(e));
      }
    }
  }

  String _formatDate(dynamic raw) {
    if (raw == null) return '';
    final dt = DateTime.tryParse(raw.toString());
    if (dt == null) return raw.toString();
    return DateFormat('dd/MM/yyyy HH:mm').format(dt.toLocal());
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Scaffold(
      backgroundColor: scheme.surfaceContainerLowest,
      body: Column(
        children: [
          AppPageHeader(
            title: 'Bài đã lưu',
            subtitle: 'Các bài đăng bạn lưu để xem lại',
            trailing: [
              IconButton(
                tooltip: 'Làm mới',
                onPressed: () => _load(),
                icon: const Icon(Icons.refresh, color: Colors.white),
              ),
            ],
          ),
          Expanded(
            child: Obx(() {
              if (_loading.value && _items.isEmpty) {
                return const AppListSkeleton(itemCount: 4);
              }
              if (_error.value.isNotEmpty && _items.isEmpty) {
                return AppErrorState(
                  message: _error.value,
                  onRetry: () => _load(),
                );
              }
              if (_items.isEmpty) {
                return AppEmptyState(
                  title: 'Chưa có bài đã lưu',
                  subtitle: 'Lưu bài đăng từ tab Trang chủ để xem lại tại đây.',
                  icon: LucideIcons.bookmark,
                  actionLabel: 'Làm mới',
                  onAction: () => _load(),
                );
              }
              return RefreshIndicator(
                onRefresh: () => _load(),
                child: ListView.separated(
                  padding: const EdgeInsets.all(AppSpacing.sm),
                  itemCount: _items.length + (_nextCursor != null ? 1 : 0),
                  separatorBuilder: (_, __) =>
                      const SizedBox(height: AppSpacing.xs),
                  itemBuilder: (context, i) {
                    if (i >= _items.length) {
                      return Padding(
                        padding:
                            const EdgeInsets.symmetric(vertical: AppSpacing.sm),
                        child: Center(
                          child: FilledButton.tonal(
                            onPressed: () => _load(append: true),
                            child: const Text('Tải thêm'),
                          ),
                        ),
                      );
                    }
                    final row = _items[i];
                    final post = row['post'];
                    final postId = row['postId']?.toString() ?? '';
                    String title = 'Bài đăng';
                    String location = '';
                    if (post is Map) {
                      title = post['title']?.toString() ?? title;
                      location = post['location']?.toString() ?? '';
                    }
                    final savedAt = _formatDate(row['createdAt']);

                    return AppListCard(
                      onTap:
                          postId.isEmpty ? null : () => _openPostDetail(postId),
                      leading: CircleAvatar(
                        backgroundColor: scheme.primaryContainer,
                        child: Icon(
                          LucideIcons.bookmark,
                          color: scheme.primary,
                          size: 18,
                        ),
                      ),
                      title: title,
                      subtitle: [
                        if (location.isNotEmpty) location,
                        if (savedAt.isNotEmpty) 'Đã lưu: $savedAt',
                      ].join(' · '),
                      trailing: IconButton(
                        tooltip: 'Bỏ lưu',
                        icon: const Icon(LucideIcons.bookmarkMinus),
                        onPressed:
                            postId.isEmpty ? null : () => _unsave(postId),
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
