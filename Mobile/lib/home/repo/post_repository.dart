import 'package:dio/dio.dart';
import 'package:mobile_app_doan/core/api_error_message.dart';
import 'package:openapi/openapi.dart';

class PostRepository {
  final PostsApi _postsApi;

  PostRepository(Openapi openapi) : _postsApi = openapi.getPostsApi();

  /// Get all public post feed
  Future<FeedResponseDto> getAllPost({int limit = 10, String? cursor}) async {
    try {
      final response = await _postsApi.postControllerGetFeed(
        limit: limit,
        cursor: cursor,
      );

      return response.data!;
    } catch (e) {
      rethrow;
    }
  }

  /// Get all my posts
  Future<FeedResponseDto> getMyPosts({int limit = 10, String? cursor}) async {
    try {
      final response = await _postsApi.postControllerGetMyPosts(
        limit: limit,
        cursor: cursor,
      );

      return response.data!;
    } catch (e) {
      rethrow;
    }
  }

  /// Create a post
  Future<PostResponseDto> createNewPost(CreatePostDto newPost) async {
    try {
      final response = await _postsApi.postControllerCreatePost(
        createPostDto: newPost,
      );

      if (response.data == null) {
        throw Exception("API returned empty body");
      }

      return response.data!;
    } on DioException catch (e) {
      final responseData = e.response?.data;
      final statusCode = e.response?.statusCode;
      if (statusCode == 403 &&
          responseData is Map<String, dynamic> &&
          responseData['code'] == 'CONTENT_MODERATION_FAILED') {
        final d = responseData['details'];
        final userMsg = d is Map && d['userMessage'] is String
            ? (d['userMessage'] as String).trim()
            : '';
        final apiMsg = responseData['message'] is String
            ? (responseData['message'] as String).trim()
            : '';
        throw Exception(
          userMsg.isNotEmpty
              ? userMsg
              : (apiMsg.isNotEmpty
                  ? apiMsg
                  : 'Nội dung bài viết vi phạm quy định cộng đồng. Vui lòng chỉnh sửa và thử lại.'),
        );
      }
      throw Exception(describeApiError(e, fallback: 'Không thể tạo bài viết'));
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deletePost(String id) async {
    try {
      await _postsApi.postControllerDeletePost(id: id);
    } on DioException catch (e) {
      throw Exception(describeApiError(e, fallback: 'Không thể xóa bài viết'));
    }
  }

  Future<PostResponseDto> updatePost(String id, UpdatePostDto newPost) async {
    try {
      final res = await _postsApi.postControllerUpdatePost(
        id: id,
        updatePostDto: newPost,
      );
      
      if (res.data == null) {
        throw Exception("API returned empty body");
      }
      
      return res.data!;
    } on DioException catch (e) {
      throw Exception(describeApiError(e, fallback: 'Không thể cập nhật bài viết'));
    } catch (e) {
      rethrow;
    }
  }

  Future<PostResponseDto> getaPost(String id) async {
    try {
      final res = await _postsApi.postControllerGetPostById(id: id);
      return res.data!;
    } on DioException catch (e) {
      throw Exception(describeApiError(e, fallback: 'Get post failed'));
    }
  }

  Future<void> closePost(String id) async {
    try {
      await _postsApi.postControllerClosePost(id: id);
    } on DioException catch (e) {
      throw Exception(describeApiError(e, fallback: 'Close post failed'));
    }
  }
}
