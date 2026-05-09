import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile_app_doan/core/api_error_message.dart';
import 'package:mobile_app_doan/core/app_route_observer.dart';
import 'package:mobile_app_doan/core/theme/app_radii.dart';
import 'package:mobile_app_doan/core/theme/app_spacing.dart';
import 'package:mobile_app_doan/core/widgets/app_empty_state.dart';
import 'package:mobile_app_doan/core/widgets/app_error_state.dart';
import 'package:mobile_app_doan/core/widgets/app_list_skeleton.dart';
import 'package:mobile_app_doan/home/controllers/post_controller.dart';
import 'package:mobile_app_doan/home/controllers/quote_controller.dart';
import 'package:mobile_app_doan/home/controllers/user_controller.dart';
import 'package:mobile_app_doan/home/repo/backend_rest_repository.dart';
import 'package:mobile_app_doan/home/widgets/article.dart';
import 'package:mobile_app_doan/home/widgets/custom_drawer.dart';
import 'package:mobile_app_doan/home/utils/post_author_id.dart';
import 'package:mobile_app_doan/home/utils/profile_navigation.dart';
import 'package:mobile_app_doan/home/widgets/post_detail_bottom_sheet.dart';
import 'package:mobile_app_doan/core/user_role_context.dart';
import 'package:mobile_app_doan/features/auth/controllers/auth_controller.dart';
import 'package:mobile_app_doan/home/widgets/dialog/create_post_dialog.dart';
import 'package:mobile_app_doan/home/widgets/dialog/create_quote_dialog.dart';
import 'package:openapi/openapi.dart';

class HomeTab extends StatefulWidget {
  const HomeTab({
    super.key,
    this.shellTabVisible = true,
  });

  /// `true` khi tab Trang chủ đang được chọn trong [IndexedStack] (đồng bộ bookmark khi đổi tab).
  final bool shellTabVisible;

  @override
  State<HomeTab> createState() => _HomeTabState();
}

class _HomeTabState extends State<HomeTab> with RouteAware {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  bool showMenu = false;
  /// Post IDs đã lưu (đồng bộ với API `/saved-posts`, role provider).
  final Set<String> _savedPostIds = {};
  final PostController postController = Get.find<PostController>();
  final QuoteController quoteController = Get.find<QuoteController>();

  String selectedCategory = "Tất cả";
  bool _loadMoreScheduled = false;
  bool _routeObserverSubscribed = false;

  @override
  void initState() {
    super.initState();
    // Lần vào trang chủ (sau đăng nhập hoặc mở app): luôn tải feed — trước đây
    // không gọi API nên danh sách trống / lỗi hiển thị.
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await postController.loadFeed();
      if (mounted) await _syncSavedFromApi();
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_routeObserverSubscribed) return;
    final route = ModalRoute.of(context);
    if (route is PageRoute<void>) {
      appRouteObserver.subscribe(this, route);
      _routeObserverSubscribed = true;
    }
  }

  @override
  void dispose() {
    if (_routeObserverSubscribed) {
      appRouteObserver.unsubscribe(this);
    }
    super.dispose();
  }

  @override
  void didUpdateWidget(HomeTab oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (!oldWidget.shellTabVisible && widget.shellTabVisible) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) _syncSavedFromApi();
      });
    }
  }

  @override
  void didPopNext() {
    if (mounted) _syncSavedFromApi();
  }

  Future<Set<String>> _fetchAllSavedPostIds() async {
    final api = Get.find<BackendRestRepository>();
    final ids = <String>{};
    String? cursor;
    const limit = 50;
    for (var page = 0; page < 20; page++) {
      final raw = await api.listSavedPosts(limit: limit, cursor: cursor);
      Map<String, dynamic>? map;
      if (raw is Map) map = Map<String, dynamic>.from(raw);
      final list = map?['data'];
      final next = map?['nextCursor']?.toString();
      if (list is List) {
        for (final e in list) {
          if (e is Map) {
            final id = e['postId']?.toString();
            if (id != null && id.isNotEmpty) ids.add(id);
          }
        }
      }
      if (next == null || next.isEmpty) break;
      cursor = next;
    }
    return ids;
  }

  Future<void> _syncSavedFromApi() async {
    if (!currentUserIsProvider()) {
      if (mounted) setState(() => _savedPostIds.clear());
      return;
    }
    try {
      final ids = await _fetchAllSavedPostIds();
      if (mounted) {
        setState(() {
          _savedPostIds
            ..clear()
            ..addAll(ids);
        });
      }
    } catch (_) {
      // Giữ trạng thái cục bộ nếu API lỗi tạm thời.
    }
  }

  Future<void> _toggleSavePost(String postId) async {
    if (!currentUserIsProvider()) {
      _showSnackBar(
        'Thông báo',
        'Chỉ tài khoản thợ mới lưu bài đăng.',
        Theme.of(context).colorScheme.tertiary,
      );
      return;
    }
    final api = Get.find<BackendRestRepository>();
    final wasSaved = _savedPostIds.contains(postId);
    try {
      if (wasSaved) {
        await api.unsavePost(postId);
        if (mounted) {
          setState(() {
            _savedPostIds.remove(postId);
          });
          _showSnackBar(
            'Đã bỏ lưu',
            'Bài đăng không còn trong danh sách đã lưu.',
            Theme.of(context).colorScheme.primary,
          );
        }
      } else {
        await api.savePost(postId);
        if (mounted) {
          setState(() {
            _savedPostIds.add(postId);
          });
          _showSnackBar(
            'Đã lưu',
            'Xem lại trong mục Bài đã lưu.',
            Theme.of(context).colorScheme.primary,
          );
        }
      }
    } catch (e) {
      if (!mounted) return;
      Get.snackbar(
        'Không thể cập nhật bài đã lưu',
        describeApiError(e),
        snackPosition: SnackPosition.BOTTOM,
        duration: const Duration(seconds: 3),
        margin: const EdgeInsets.all(12),
        borderRadius: 12,
      );
    }
  }

  Future<void> _refreshHomeFeed() async {
    await postController.refreshFeed();
    if (mounted) await _syncSavedFromApi();
  }

  final List<Map<String, String>> categories = [
    {"icon": "⚡", "name": "Điện"},
    {"icon": "🎨", "name": "Sơn"},
    {"icon": "🔨", "name": "Mộc"},
    {"icon": "❄️", "name": "Điều hòa"},
    {"icon": "🧹", "name": "Vệ sinh"},
    {"icon": "🌿", "name": "Vườn"},
  ];
  void _openDrawer() async {
    _scaffoldKey.currentState?.openEndDrawer();
  }

  /// ✅ Submit new post

  void _showSnackBar(String title, String message, Color color) {
    Get.snackbar(
      title,
      message,
      backgroundColor: color.withValues(alpha: 0.18),
      colorText: color,
      snackPosition: SnackPosition.BOTTOM,
      duration: const Duration(seconds: 2),
      margin: const EdgeInsets.all(12),
      borderRadius: 12,
    );
  }

  void _reportPost(PostResponseDto post) {
    final postTitle = post.title;

    Get.snackbar(
      "Đã báo cáo bài viết",
      "Cảm ơn bạn đã gửi phản hồi. Chúng tôi sẽ kiểm tra $postTitle",
      snackPosition: SnackPosition.BOTTOM,
      duration: const Duration(seconds: 2),
      backgroundColor: Colors.red.withValues(alpha: 0.1),
      colorText: Colors.red.shade700,
      margin: const EdgeInsets.all(12),
    );
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: scheme.surfaceContainerLowest,
      endDrawer: const CustomDrawer(),
      body: SafeArea(
        child: Stack(
          children: [
            Column(
              children: [
                // ✅ HEADER
                Container(
                  color: scheme.surface,
                  child: Column(
                    children: [
                      Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.sm,
                          vertical: 10,
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                Container(
                                  width: 44,
                                  height: 44,
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                      colors: [scheme.primary, scheme.secondary],
                                    ),
                                    borderRadius: BorderRadius.circular(AppRadii.md),
                                    boxShadow: [
                                      BoxShadow(
                                        color: scheme.primary.withValues(alpha: 0.28),
                                        blurRadius: 10,
                                        offset: const Offset(0, 4),
                                      ),
                                    ],
                                  ),
                                  child: Icon(
                                    LucideIcons.hammer,
                                    color: scheme.onPrimary,
                                    size: 22,
                                  ),
                                ),
                                const SizedBox(width: AppSpacing.xs),
                                Text(
                                  'Thợ Tốt',
                                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                        fontWeight: FontWeight.w800,
                                        letterSpacing: -0.3,
                                      ),
                                ),
                              ],
                            ),
                            IconButton(
                              icon: Icon(
                                showMenu ? LucideIcons.x : LucideIcons.menu,
                              ),
                              onPressed: _openDrawer,
                            ),
                          ],
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.sm,
                          vertical: AppSpacing.xs,
                        ),
                        child: TextField(
                          decoration: InputDecoration(
                            prefixIcon: Icon(
                              LucideIcons.search,
                              size: 20,
                              color: scheme.onSurfaceVariant,
                            ),
                            hintText: 'Tìm kiếm yêu cầu, thợ...',
                            hintStyle: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: scheme.onSurfaceVariant.withValues(alpha: 0.75),
                                ),
                            filled: true,
                            fillColor: scheme.surfaceContainerHighest.withValues(alpha: 0.55),
                            isDense: true,
                            contentPadding: const EdgeInsets.symmetric(
                              vertical: AppSpacing.xs + 2,
                              horizontal: AppSpacing.xs,
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(999),
                              borderSide: BorderSide(
                                color: scheme.outlineVariant.withValues(alpha: 0.35),
                              ),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(999),
                              borderSide: BorderSide(
                                color: scheme.outlineVariant.withValues(alpha: 0.35),
                              ),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(999),
                              borderSide: BorderSide(color: scheme.primary, width: 1.5),
                            ),
                          ),
                        ),
                      ),
                      SizedBox(
                        height: 45,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          padding: const EdgeInsets.only(left: AppSpacing.sm),
                          itemCount: categories.length + 1,
                          itemBuilder: (context, index) {
                            if (index == 0) {
                              final isSelected = selectedCategory == 'Tất cả';
                              return Padding(
                                padding: const EdgeInsets.only(right: AppSpacing.xs),
                                child: FilterChip(
                                  showCheckmark: false,
                                  selected: isSelected,
                                  label: const Text('Tất cả'),
                                  onSelected: (_) {
                                    setState(() => selectedCategory = 'Tất cả');
                                  },
                                ),
                              );
                            }

                            final cat = categories[index - 1];
                            final isSelected = selectedCategory == cat['name'];

                            return Padding(
                              padding: const EdgeInsets.only(right: AppSpacing.xs),
                              child: FilterChip(
                                showCheckmark: false,
                                selected: isSelected,
                                label: Text('${cat['icon']} ${cat['name']}'),
                                onSelected: (_) {
                                  setState(() => selectedCategory = cat['name']!);
                                },
                              ),
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 8),
                    ],
                  ),
                ),

                // ✅ LIST BÀI VIẾT
                Expanded(
                  child: Obx(() {
                    Get.find<AuthController>().userRole.value;
                    Get.find<ProfileController>().profile.value;
                    final controller = postController;

                    // -----------------------------
                    // 1. Loading lần đầu
                    // -----------------------------
                    if (controller.isLoading.value &&
                        controller.posts.isEmpty) {
                      return const AppListSkeleton(itemCount: 5);
                    }

                    // -----------------------------
                    // 2. Không có bài hoặc lỗi
                    // -----------------------------
                    if (controller.posts.isEmpty) {
                      final err = controller.errorMessage.value;
                      if (err.isNotEmpty) {
                        return AppErrorState(
                          message: err,
                          onRetry: _refreshHomeFeed,
                        );
                      }
                      return AppEmptyState(
                        title: 'Chưa có bài viết',
                        subtitle: 'Kéo xuống để làm mới hoặc đăng bài mới.',
                        icon: LucideIcons.inbox,
                        actionLabel: 'Làm mới',
                        onAction: _refreshHomeFeed,
                      );
                    }

                    // -----------------------------
                    // 3. Lọc danh mục
                    // -----------------------------
                    final filteredPosts = selectedCategory == "Tất cả"
                        ? controller.posts
                        : controller.posts.where((p) {
                            final category = ""; // Nếu có trường category
                            return category.toLowerCase() ==
                                selectedCategory.toLowerCase();
                          }).toList();

                    if (filteredPosts.isEmpty) {
                      return AppEmptyState(
                        title: 'Không có bài phù hợp',
                        subtitle:
                            "Không có bài đăng cho danh mục '$selectedCategory'.",
                        icon: Icons.category_outlined,
                      );
                    }

                    // -----------------------------
                    // 4. Danh sách bài viết
                    // -----------------------------
                    return ListView.builder(
                      padding: EdgeInsets.zero,
                      itemCount: filteredPosts.length + 1,
                      itemBuilder: (context, index) {
                        // LOAD MORE
                        if (index == filteredPosts.length) {
                          if (!controller.hasMore) {
                            return const SizedBox.shrink();
                          }

                          if (controller.isLoading.value) {
                            return const Padding(
                              padding: EdgeInsets.all(16),
                              child: Center(child: CircularProgressIndicator()),
                            );
                          }

                          if (!_loadMoreScheduled) {
                            _loadMoreScheduled = true;
                            WidgetsBinding.instance.addPostFrameCallback((_) async {
                              await controller.loadMoreFeed();
                              if (mounted) await _syncSavedFromApi();
                              if (mounted) {
                                setState(() {
                                  _loadMoreScheduled = false;
                                });
                              } else {
                                _loadMoreScheduled = false;
                              }
                            });
                          }

                          return const SizedBox.shrink();
                        }

                        final post = filteredPosts[index];

                        // -----------------------------
                        // Những field chuẩn của PostResponseDto
                        // -----------------------------
                        final postId = post.id;
                        final isSaved = _savedPostIds.contains(postId);
                        final authorUserId = postAuthorUserId(post);

                        return Article(
                          postResponseDto: post,
                          isSaved: isSaved,
                          onCustomerProfileTap: authorUserId != null
                              ? () => navigateToPublicProfile(authorUserId)
                              : null,
                          onSave: () {
                            _toggleSavePost(postId);
                          },
                          // Chỉ Provider mới được chào giá
                          onbid: currentUserIsProvider()
                              ? () async {
                                  final result = await showDialog(
                                    context: context,
                                    builder: (context) =>
                                        CreateQuoteDialog(postId: postId),
                                  );

                                  if (result != null) {
                                    final quote = CreateQuoteDto(
                                      (b) => b
                                        ..postId = result['postId']
                                        ..price = result['price']
                                        ..description = result['description']
                                        ..terms = result['terms']
                                        ..estimatedDuration =
                                            result['estimatedDuration']
                                        ..imageUrls = result['imageUrls'],
                                    );

                                    await quoteController.createQuote(quote);
                                  }
                                }
                              : null,
                          onViewDetail: () => showPostDetailBottomSheet(context, post),
                          onReport: () => _reportPost(post),
                          menuType: ArticleMenuType.home,
                        );
                      },
                    );
                  }),
                ),
              ],
            ),
            // Chỉ Customer mới được đăng bài (backend @Roles customer).
            Obx(() {
              if (currentUserIsProvider()) return const SizedBox.shrink();
              return Positioned(
                bottom: 88,
                right: AppSpacing.sm,
                child: FloatingActionButton(
                  elevation: 3,
                  highlightElevation: 6,
                  tooltip: 'Đăng yêu cầu mới',
                  onPressed: () {
                    CreatePostDialog.show(
                      context,
                      onSubmit: (data) async {
                        final success = await postController.createPost(data);
                        if (success && context.mounted) {
                          _showSnackBar(
                            'Thành công',
                            'Đăng bài thành công!',
                            Theme.of(context).colorScheme.primary,
                          );
                        }
                      },
                    );
                  },
                  child: const Icon(LucideIcons.plus),
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}
