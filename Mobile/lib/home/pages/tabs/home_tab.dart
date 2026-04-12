import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile_app_doan/home/controllers/post_controller.dart';
import 'package:mobile_app_doan/home/controllers/quote_controller.dart';
import 'package:mobile_app_doan/home/widgets/article.dart';
import 'package:mobile_app_doan/home/widgets/custom_drawer.dart';
import 'package:mobile_app_doan/home/widgets/dialog/create_post_dialog.dart';
import 'package:mobile_app_doan/home/widgets/dialog/create_quote_dialog.dart';
import 'package:openapi/openapi.dart';

class HomeTab extends StatefulWidget {
  const HomeTab({super.key});

  @override
  State<HomeTab> createState() => _HomeTabState();
}

class _HomeTabState extends State<HomeTab> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  bool showMenu = false;
  List<String> savedPosts = [];
  final PostController postController = Get.find<PostController>();
  final QuoteController quoteController = Get.find<QuoteController>();
  String selectedCategory = "Tất cả";
  bool _loadMoreScheduled = false;

  final List<Map<String, String>> categories = [
    {"icon": "⚡", "name": "Điện"},
    {"icon": "🎨", "name": "Sơn"},
    {"icon": "🔨", "name": "Mộc"},
    {"icon": "❄️", "name": "Điều hòa"},
    {"icon": "🧹", "name": "Vệ sinh"},
    {"icon": "🌿", "name": "Vườn"},
  ];
  void toggleSave(String id) {
    setState(() {
      if (savedPosts.contains(id)) {
        savedPosts.remove(id);
      } else {
        savedPosts.add(id);
      }
    });
  }

  void _openDrawer() async {
    _scaffoldKey.currentState?.openEndDrawer();
  }

  /// ✅ Submit new post

  void _showSnackBar(String title, String message, Color color) {
    Get.snackbar(
      title,
      message,
      backgroundColor: color.withValues(alpha: 0.15),
      colorText: color,
      snackPosition: SnackPosition.BOTTOM,
      duration: const Duration(seconds: 2),
      margin: const EdgeInsets.all(12),
      borderRadius: 8,
    );
  }

  void _showPostDetailSheet(PostResponseDto post) {
    if (!mounted) return;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        final images = post.imageUrls?.toList() ?? [];
        final mainImage = images.isNotEmpty ? images.first : null;
        final desiredTime = post.desiredTime != null
            ? post.desiredTime!.toLocal().toString()
            : 'Chưa xác định';

        return Padding(
          padding: const EdgeInsets.all(20),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        post.title,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                if (mainImage != null)
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.network(
                      mainImage,
                      height: 180,
                      width: double.infinity,
                      fit: BoxFit.cover,
                    ),
                  ),
                const SizedBox(height: 16),
                Text(
                  post.description,
                  style: const TextStyle(fontSize: 14, height: 1.4),
                ),
                const SizedBox(height: 16),
                _detailRow('Địa điểm', post.location ?? 'Chưa xác định'),
                const SizedBox(height: 8),
                _detailRow('Thời gian mong muốn', desiredTime),
                const SizedBox(height: 8),
                _detailRow(
                  'Ngân sách',
                  post.budget != null ? '${post.budget} đ' : 'Chưa cung cấp',
                ),
              ],
            ),
          ),
        );
      },
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

  Widget _detailRow(String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '$label: ',
          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
        ),
        Expanded(child: Text(value, style: const TextStyle(fontSize: 13))),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: Colors.grey[50],
      endDrawer: const CustomDrawer(),
      body: SafeArea(
        child: Stack(
          children: [
            Column(
              children: [
                // ✅ HEADER
                Container(
                  color: Colors.white,
                  child: Column(
                    children: [
                      Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 10,
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                Container(
                                  width: 40,
                                  height: 40,
                                  decoration: BoxDecoration(
                                    gradient: const LinearGradient(
                                      colors: [Colors.teal, Colors.tealAccent],
                                    ),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: const Center(
                                    child: Text(
                                      'T',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 20,
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                const Text(
                                  "Thợ Tốt",
                                  style: TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                            Row(
                              children: [
                                IconButton(
                                  icon: const Icon(LucideIcons.bell),
                                  onPressed: () {},
                                ),
                                IconButton(
                                  icon: const Icon(LucideIcons.messageSquare),
                                  onPressed: () {},
                                ),
                                IconButton(
                                  icon: Icon(
                                    showMenu ? LucideIcons.x : LucideIcons.menu,
                                  ),
                                  onPressed: _openDrawer,
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                        child: TextField(
                          decoration: InputDecoration(
                            prefixIcon: const Icon(LucideIcons.search),
                            hintText: "Tìm kiếm yêu cầu, thợ...",
                            filled: true,
                            fillColor: Colors.grey[200],
                            contentPadding: const EdgeInsets.symmetric(
                              vertical: 10,
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(30),
                              borderSide: BorderSide.none,
                            ),
                          ),
                        ),
                      ),
                      SizedBox(
                        height: 45,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          padding: const EdgeInsets.only(left: 16),
                          itemCount: categories.length + 1,
                          itemBuilder: (context, index) {
                            if (index == 0) {
                              final isSelected = selectedCategory == "Tất cả";
                              return GestureDetector(
                                onTap: () {
                                  setState(() => selectedCategory = "Tất cả");
                                },
                                child: Container(
                                  margin: const EdgeInsets.only(right: 8),
                                  child: Chip(
                                    backgroundColor: isSelected
                                        ? Colors.teal
                                        : Colors.grey[200],
                                    label: Text(
                                      "Tất cả",
                                      style: TextStyle(
                                        color: isSelected
                                            ? Colors.white
                                            : Colors.black87,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                ),
                              );
                            }

                            final cat = categories[index - 1];
                            final isSelected = selectedCategory == cat['name'];

                            return GestureDetector(
                              onTap: () {
                                setState(() => selectedCategory = cat['name']!);
                              },
                              child: Container(
                                margin: const EdgeInsets.only(right: 8),
                                child: Chip(
                                  backgroundColor: isSelected
                                      ? Colors.teal
                                      : Colors.grey[200],
                                  label: Text(
                                    "${cat['icon']} ${cat['name']}",
                                    style: TextStyle(
                                      color: isSelected
                                          ? Colors.white
                                          : Colors.black87,
                                      fontWeight: isSelected
                                          ? FontWeight.bold
                                          : FontWeight.normal,
                                    ),
                                  ),
                                ),
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
                    final controller = postController;

                    // -----------------------------
                    // 1. Loading lần đầu
                    // -----------------------------
                    if (controller.isLoading.value &&
                        controller.posts.isEmpty) {
                      return const Center(child: CircularProgressIndicator());
                    }

                    // -----------------------------
                    // 2. Không có bài hoặc lỗi
                    // -----------------------------
                    if (controller.posts.isEmpty) {
                      return Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              LucideIcons.alertCircle,
                              size: 48,
                              color: Colors.red,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              controller.errorMessage.value.isEmpty
                                  ? "Không có bài viết"
                                  : controller.errorMessage.value,
                              textAlign: TextAlign.center,
                              style: const TextStyle(fontSize: 14),
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton.icon(
                              onPressed: controller.refreshFeed,
                              icon: const Icon(Icons.refresh),
                              label: const Text("Thử lại"),
                            ),
                          ],
                        ),
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
                      return Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              LucideIcons.inbox,
                              size: 48,
                              color: Colors.grey[400],
                            ),
                            const SizedBox(height: 16),
                            Text(
                              "Không có bài đăng danh mục '$selectedCategory'",
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
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
                        final isSaved = savedPosts.contains(postId);

                        return Article(
                          // Không convert sang Map nữa
                          postResponseDto: post,
                          isSaved: isSaved,
                          onSave: () => toggleSave(postId),
                          onbid: () async {
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
                          },
                          onViewDetail: () => _showPostDetailSheet(post),
                          onReport: () => _reportPost(post),
                          menuType: ArticleMenuType.home,
                        );
                      },
                    );
                  }),
                ),
              ],
            ),
            Positioned(
              bottom: 80,
              right: 16,
              child: FloatingActionButton(
                backgroundColor: Colors.teal,
                onPressed: () {
                  CreatePostDialog.show(
                    context,
                    onSubmit: (data) async {
                      print("🔥 onSubmit được gọi");
                      final success = await postController.createPost(data);
                      if (success && context.mounted) {
                        _showSnackBar(
                          "Thành công",
                          "Đăng bài thành công!",
                          Colors.teal,
                        );
                      }
                    },
                  );
                },
                child: const Icon(LucideIcons.plus),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
