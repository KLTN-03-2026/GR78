import 'package:dio/dio.dart';
import 'package:mobile_app_doan/core/api.dart';
import 'package:mobile_app_doan/home/pages/model/post.dart';

class PostService {
  // ✅ Tạo bài post mới - GỌI API THỰC
  Future<Map<String, dynamic>?> createPost(PostRequest post) async {
    try {
      print('📤 Creating post: ${post.toJson()}');

      final response = await dio.post('/posts', data: post.toJson());

      if (response.statusCode == 201) {
        print('✅ Post created: ${response.data}');
        return response.data;
      } else {
        throw Exception('❌ Lỗi tạo bài post: ${response.statusCode}');
      }
    } on DioException catch (e) {
      print('❌ Lỗi Dio: ${e.response?.data}');
      print('❌ Lỗi message: ${e.message}');
      rethrow;
    } catch (e) {
      print('❌ Lỗi không xác định: $e');
      rethrow;
    }
  }

  // ✅ Lấy danh sách bài post
  Future<Map<String, dynamic>> getPublicFeed({
    int limit = 10,
    String? cursor,
  }) async {
    try {
      print('🔵 Fetching feed: limit=$limit, cursor=$cursor');

      final response = await dio.get(
        '/posts/feed',
        queryParameters: {'limit': limit, if (cursor != null) 'cursor': cursor},
      );

      if (response.statusCode == 200) {
        print(
          '✅ Feed loaded: ${response.data.toString().substring(0, 100)}...',
        );
        return response.data;
      } else {
        throw Exception('❌ Lỗi tải feed: ${response.statusCode}');
      }
    } on DioException catch (e) {
      print('❌ Lỗi Dio: ${e.message}');
      throw Exception('❌ Lỗi tải feed: ${e.message}');
    }
  }

  // edit post
  Future<Map<String, dynamic>?> updatePost(
    String postId,
    PostRequest postRequest,
  ) async {
    try {
      print('📝 Updating post $postId: ${postRequest.toJson()}');

      final response = await dio.patch(
        '/posts/$postId',
        data: postRequest.toJson(),
        options: Options(
          validateStatus: (status) => status != null && status < 500,
        ),
      );

      if (response.statusCode == 200) {
        print('✅ Post updated: ${response.data}');
        return response.data as Map<String, dynamic>?;
      }

      // Log server/client error payload for debugging
      print('❌ Update failed: ${response.statusCode} ${response.data}');
      return null;
    } on DioException catch (e) {
      print('❌ DioException in updatePost: ${e.response?.data ?? e.message}');
      rethrow;
    } catch (e) {
      print('❌ Unexpected error in updatePost: $e');
      rethrow;
    }
  }

  // delete post
  Future<bool> deletePost(String postId) async {
    try {
      print('🗑️ Deleting post $postId');

      final response = await dio.delete(
        '/posts/$postId',
        options: Options(
          validateStatus: (status) => status != null && status < 500,
        ),
      );

      if (response.statusCode == 200 || response.statusCode == 204) {
        print('✅ Post deleted: ${response.statusCode}');
        return true;
      }

      // Log lỗi server/client để debug
      print('❌ Delete failed: ${response.statusCode} ${response.data}');
      return false;
    } on DioException catch (e) {
      print('❌ DioException in deletePost: ${e.response?.data ?? e.message}');
      rethrow;
    } catch (e) {
      print('❌ Unexpected error in deletePost: $e');
      rethrow;
    }
  }

  // get my posts
  Future<Map<String, dynamic>> getMyPosts({
    int limit = 10,
    String? cursor,
  }) async {
    try {
      print('🔵 Fetching my posts: limit=$limit, cursor=$cursor');

      final response = await dio.get(
        '/posts/my/posts',
        queryParameters: {'limit': limit, if (cursor != null) 'cursor': cursor},
      );

      if (response.statusCode == 200) {
        print(
          '✅ My posts loaded: ${response.data.toString().substring(0, 100)}...',
        );
        return response.data;
      } else {
        throw Exception('❌ Lỗi tải bài viết của tôi: ${response.statusCode}');
      }
    } on DioException catch (e) {
      print('❌ Lỗi Dio: ${e.message}');
      throw Exception('❌ Lỗi tải bài viết của tôi: ${e.message}');
    }
  }
}
