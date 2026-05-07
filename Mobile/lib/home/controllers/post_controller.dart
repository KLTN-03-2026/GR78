import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile_app_doan/home/repo/post_repository.dart';
import 'package:openapi/openapi.dart';
import 'package:built_collection/built_collection.dart';
import 'package:dio/dio.dart';

class PostController extends GetxController {
  final PostRepository repository;

  PostController(this.repository);

  final posts = <PostResponseDto>[].obs;
  final myPosts = <PostResponseDto>[].obs;

  final isLoading = false.obs;
  final isCreating = false.obs;
  final isUpdating = false.obs;
  final isDeleting = false.obs;

  final errorMessage = ''.obs;
  final successMessage = ''.obs;

  String? _cursor;
  bool _hasMore = true;

  bool get hasMore => _hasMore;

  // --------------------------
  // LOAD PUBLIC FEED
  // --------------------------
  Future<void> loadFeed() async {
    try {
      isLoading.value = true;
      errorMessage.value = '';

      final result = await repository.getAllPost(limit: 10);

      posts.value = result.data.toList();
      _cursor = result.nextCursor;
      _hasMore = _cursor != null;
    } catch (e) {
      errorMessage.value = "Lỗi tải bài viết: $e";
    } finally {
      isLoading.value = false;
    }
  }

  // --------------------------
  // LOAD MORE (PAGINATION)
  // --------------------------
  Future<void> loadMoreFeed() async {
    if (!_hasMore || isLoading.value) return;

    try {
      isLoading.value = true;

      final result = await repository.getAllPost(limit: 10, cursor: _cursor);

      posts.addAll(result.data.toList());

      _cursor = result.nextCursor;
      _hasMore = _cursor != null;
    } on DioException catch (e) {
      // Stop infinite retry loops when server is failing.
      final status = e.response?.statusCode;
      errorMessage.value = "Không thể tải thêm bài viết (${status ?? 'Lỗi'}).";
      if (status != null && status >= 500) {
        _hasMore = false;
      }
      print("❌ Load more error: $e");
    } catch (e) {
      errorMessage.value = "Không thể tải thêm bài viết.";
      print("❌ Load more error: $e");
    } finally {
      isLoading.value = false;
    }
  }

  // --------------------------
  // REFRESH FEED
  // --------------------------
  Future<void> refreshFeed() async {
    _cursor = null;
    _hasMore = true;
    await loadFeed();
  }

  // --------------------------
  // CREATE POST
  // --------------------------
  Future<bool> createPost(CreatePostDto createPostDto) async {
    try {
      isCreating.value = true;
      errorMessage.value = '';
      successMessage.value = '';

      await repository.createNewPost(createPostDto);

      successMessage.value = "Đăng bài thành công!";
      await loadFeed();

      return true;
    } catch (e) {
      final message = "Lỗi tạo bài: $e";
      errorMessage.value = message;
      Get.snackbar(
        "Không thể đăng bài",
        e.toString(),
        snackPosition: SnackPosition.BOTTOM,
        duration: const Duration(seconds: 3),
        backgroundColor: const Color(0xFFFFF1F2),
        colorText: Colors.redAccent,
      );
      return false;
    } finally {
      isCreating.value = false;
    }
  }

  // --------------------------
  // UPDATE POST
  // --------------------------
  Future<bool> updatePost({
    required String id,
    required UpdatePostDto post,
  }) async {
    try {
      isUpdating.value = true;
      errorMessage.value = '';
      successMessage.value = '';

      final req = UpdatePostDto(
        (b) => b
          ..title = post.title
          ..description = post.description
          ..location = post.location
          ..desiredTime = post.desiredTime?.toUtc()
          ..budget = post.budget
          ..imageUrls = post.imageUrls != null
              ? ListBuilder<String>(post.imageUrls!.toList())
              : null,
      );

      final updated = await repository.updatePost(id, req);

      // Cập nhật trong danh sách posts
      final index = posts.indexWhere((p) => p.id == id);
      if (index != -1) {
        posts[index] = updated;
      }

      // Cập nhật trong danh sách myPosts nếu có
      final myIndex = myPosts.indexWhere((p) => p.id == id);
      if (myIndex != -1) {
        myPosts[myIndex] = updated;
      }

      successMessage.value = "Cập nhật bài viết thành công!";
      return true;
    } catch (e) {
      errorMessage.value = "Lỗi cập nhật bài: $e";
      return false;
    } finally {
      isUpdating.value = false;
    }
  }

  // --------------------------
  // DELETE POST
  // --------------------------
  Future<bool> deletePost(String id) async {
    try {
      isDeleting.value = true;
      errorMessage.value = '';
      successMessage.value = '';

      await repository.deletePost(id);

      // Xóa khỏi danh sách posts
      posts.removeWhere((p) => p.id == id);

      // Xóa khỏi danh sách myPosts nếu có
      myPosts.removeWhere((p) => p.id == id);

      successMessage.value = "Xóa bài thành công!";
      Get.snackbar(
        "Thành công",
        "Bài viết đã được xóa",
        snackPosition: SnackPosition.BOTTOM,
        duration: const Duration(seconds: 2),
      );
      return true;
    } catch (e) {
      errorMessage.value = "Lỗi xóa bài: $e";
      return false;
    } finally {
      isDeleting.value = false;
    }
  }

  // --------------------------
  // LOAD MY POSTS
  // --------------------------
  Future<void> loadMyPosts() async {
    try {
      isLoading.value = true;

      final result = await repository.getMyPosts(limit: 10);

      myPosts.value = result.data.toList();
      _cursor = result.nextCursor;
      _hasMore = _cursor != null;
    } catch (e) {
      errorMessage.value = "Không thể tải bài của tôi: $e";
    } finally {
      isLoading.value = false;
    }
  }
}
