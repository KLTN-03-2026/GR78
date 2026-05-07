import 'package:dio/dio.dart';
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
      String errorMsg = "Không thể tạo bài viết";

      final responseData = e.response?.data;
      final statusCode = e.response?.statusCode;

      if (statusCode == 403 &&
          responseData is Map<String, dynamic> &&
          responseData['code'] == 'CONTENT_MODERATION_FAILED') {
        errorMsg = responseData['details']?['userMessage'] ??
            responseData['message'] ??
            "Nội dung bài viết vi phạm quy định cộng đồng. Vui lòng chỉnh sửa và thử lại.";
      } else if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout ||
          e.type == DioExceptionType.sendTimeout) {
        errorMsg = "Kết nối timeout. Vui lòng kiểm tra kết nối mạng và thử lại.";
      } else if (e.type == DioExceptionType.connectionError) {
        errorMsg = "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.";
      } else if (responseData != null) {
        if (responseData is Map) {
          errorMsg = responseData['message'] ??
              responseData['error'] ??
              errorMsg;
        } else if (responseData is String) {
          errorMsg = responseData;
        }
      } else if (e.message != null && e.message!.isNotEmpty) {
        errorMsg = e.message!;
      }

      throw Exception(errorMsg);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> deletePost(String id) async {
    try {
      await _postsApi.postControllerDeletePost(id: id);
    } on DioException catch (e) {
      String errorMsg = "Không thể xóa bài viết";
      
      if (e.type == DioExceptionType.connectionTimeout || 
          e.type == DioExceptionType.receiveTimeout ||
          e.type == DioExceptionType.sendTimeout) {
        errorMsg = "Kết nối timeout. Vui lòng kiểm tra kết nối mạng và thử lại.";
      } else if (e.type == DioExceptionType.connectionError) {
        errorMsg = "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.";
      } else if (e.response?.data != null) {
        if (e.response!.data is Map) {
          errorMsg = e.response!.data['message'] ?? 
                     e.response!.data['error'] ?? 
                     errorMsg;
        } else if (e.response!.data is String) {
          errorMsg = e.response!.data;
        }
      } else if (e.message != null && e.message!.isNotEmpty) {
        errorMsg = e.message!;
      }
      
      throw Exception(errorMsg);
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
      String errorMsg = "Không thể cập nhật bài viết";
      
      if (e.type == DioExceptionType.connectionTimeout || 
          e.type == DioExceptionType.receiveTimeout ||
          e.type == DioExceptionType.sendTimeout) {
        errorMsg = "Kết nối timeout. Vui lòng kiểm tra kết nối mạng và thử lại.";
      } else if (e.type == DioExceptionType.connectionError) {
        errorMsg = "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.";
      } else if (e.response?.data != null) {
        if (e.response!.data is Map) {
          errorMsg = e.response!.data['message'] ?? 
                     e.response!.data['error'] ?? 
                     errorMsg;
        } else if (e.response!.data is String) {
          errorMsg = e.response!.data;
        }
      } else if (e.message != null && e.message!.isNotEmpty) {
        errorMsg = e.message!;
      }
      
      throw Exception(errorMsg);
    } catch (e) {
      rethrow;
    }
  }

  Future<PostResponseDto> getaPost(String id) async {
    try {
      final res = await _postsApi.postControllerGetPostById(id: id);
      return res.data!;
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ?? "Get post failed";
      throw Exception(msg);
    }
  }

  Future<void> closePost(String id) async {
    try {
      await _postsApi.postControllerClosePost(id: id);
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ?? "Close post failed";
      throw Exception(msg);
    }
  }
}
