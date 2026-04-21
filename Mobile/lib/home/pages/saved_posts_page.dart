import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile_app_doan/home/controllers/user_controller.dart';
import 'package:mobile_app_doan/home/repo/backend_rest_repository.dart';
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
    if (profile?.role != UserRole.provider) {
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
        final rows = list.whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
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
      _error.value = e.toString();
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
      Get.snackbar('Lỗi', e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bài đã lưu'),
        actions: [
          IconButton(
            onPressed: () => _load(),
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: Obx(() {
        if (_loading.value && _items.isEmpty) {
          return const Center(child: CircularProgressIndicator());
        }
        if (_error.value.isNotEmpty && _items.isEmpty) {
          return Padding(
            padding: const EdgeInsets.all(24),
            child: Center(child: Text(_error.value, textAlign: TextAlign.center)),
          );
        }
        if (_items.isEmpty) {
          return const Center(child: Text('Chưa có bài đã lưu'));
        }
        return RefreshIndicator(
          onRefresh: () => _load(),
          child: ListView.separated(
            padding: const EdgeInsets.all(12),
            itemCount: _items.length + (_nextCursor != null ? 1 : 0),
            separatorBuilder: (_, __) => const SizedBox(height: 8),
            itemBuilder: (context, i) {
              if (i >= _items.length) {
                return TextButton(
                  onPressed: () => _load(append: true),
                  child: const Text('Tải thêm'),
                );
              }
              final row = _items[i];
              final post = row['post'];
              final postId = row['postId']?.toString() ?? '';
              String title = 'Bài đăng';
              if (post is Map) {
                title = post['title']?.toString() ?? title;
              }
              return Card(
                child: ListTile(
                  title: Text(title, maxLines: 2, overflow: TextOverflow.ellipsis),
                  subtitle: Text('Đã lưu: ${row['createdAt'] ?? ''}'),
                  trailing: IconButton(
                    icon: const Icon(Icons.bookmark_remove_outlined),
                    onPressed: postId.isEmpty ? null : () => _unsave(postId),
                  ),
                ),
              );
            },
          ),
        );
      }),
    );
  }
}
