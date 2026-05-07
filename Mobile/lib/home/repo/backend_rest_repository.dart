import 'package:dio/dio.dart';

/// Gọi thẳng các route NestJS khi client OpenAPI chưa được generate đầy đủ.
/// Dùng cùng [Dio] với Openapi (interceptor refresh token vẫn áp dụng).
class BackendRestRepository {
  BackendRestRepository(this._dio);

  final Dio _dio;

  String _err(DioException e) =>
      e.response?.data is Map && (e.response!.data as Map)['message'] != null
          ? (e.response!.data as Map)['message'].toString()
          : e.message ?? 'Request failed';

  // ─── Auth (common, không bearer) ─────────────────────────────────────────
  Future<void> forgotPassword(String email) async {
    try {
      await _dio.post<Object>(
        '/auth/forgot-password',
        data: {'email': email.trim().toLowerCase()},
      );
    } on DioException catch (e) {
      throw Exception(_err(e));
    }
  }

  Future<void> resetPassword({
    required String token,
    required String newPassword,
  }) async {
    try {
      await _dio.post<Object>(
        '/auth/reset-password',
        data: {'token': token, 'newPassword': newPassword},
      );
    } on DioException catch (e) {
      throw Exception(_err(e));
    }
  }

  // ─── Saved posts (provider) ──────────────────────────────────────────────
  Future<dynamic> savePost(String postId) async {
    try {
      final res = await _dio.post<Object>('/saved-posts', data: {'postId': postId});
      return res.data;
    } on DioException catch (e) {
      throw Exception(_err(e));
    }
  }

  Future<dynamic> listSavedPosts({int? limit, String? cursor}) async {
    try {
      final res = await _dio.get<Object>(
        '/saved-posts',
        queryParameters: {
          if (limit != null) 'limit': limit,
          if (cursor != null) 'cursor': cursor,
        },
      );
      return res.data;
    } on DioException catch (e) {
      throw Exception(_err(e));
    }
  }

  Future<int> savedPostsCount() async {
    try {
      final res = await _dio.get<Object>('/saved-posts/count');
      final data = res.data;
      if (data is Map && data['count'] is num) {
        return (data['count'] as num).toInt();
      }
      throw Exception('Invalid count response');
    } on DioException catch (e) {
      throw Exception(_err(e));
    }
  }

  Future<bool> isPostSaved(String postId) async {
    try {
      final res = await _dio.get<Object>('/saved-posts/check/$postId');
      final data = res.data;
      if (data is Map && data['isSaved'] is bool) {
        return data['isSaved'] as bool;
      }
      return false;
    } on DioException catch (e) {
      throw Exception(_err(e));
    }
  }

  Future<void> unsavePost(String postId) async {
    try {
      await _dio.delete<Object>('/saved-posts/$postId');
    } on DioException catch (e) {
      throw Exception(_err(e));
    }
  }

  // ─── Orders ───────────────────────────────────────────────────────────────
  Future<dynamic> listOrders({String? status}) async {
    try {
      final res = await _dio.get<Object>(
        '/orders',
        queryParameters: {if (status != null && status.isNotEmpty) 'status': status},
      );
      return res.data;
    } on DioException catch (e) {
      throw Exception(_err(e));
    }
  }

  Future<dynamic> orderStats() async {
    try {
      final res = await _dio.get<Object>('/orders/stats');
      return res.data;
    } on DioException catch (e) {
      throw Exception(_err(e));
    }
  }

  Future<dynamic> getOrder(String id) async {
    try {
      final res = await _dio.get<Object>('/orders/$id');
      return res.data;
    } on DioException catch (e) {
      throw Exception(_err(e));
    }
  }

  Future<dynamic> getOrderByNumber(String orderNumber) async {
    try {
      final res = await _dio.get<Object>('/orders/number/$orderNumber');
      return res.data;
    } on DioException catch (e) {
      throw Exception(_err(e));
    }
  }

  Future<dynamic> confirmOrderFromQuote(String quoteId) async {
    try {
      final res = await _dio.post<Object>('/orders/confirm-from-quote/$quoteId');
      return res.data;
    } on DioException catch (e) {
      throw Exception(_err(e));
    }
  }

  Future<dynamic> providerCompleteOrder(String orderId) async {
    try {
      final res = await _dio.post<Object>('/orders/$orderId/provider-complete');
      return res.data;
    } on DioException catch (e) {
      throw Exception(_err(e));
    }
  }

  Future<dynamic> customerCompleteOrder(String orderId) async {
    try {
      final res = await _dio.post<Object>('/orders/$orderId/customer-complete');
      return res.data;
    } on DioException catch (e) {
      throw Exception(_err(e));
    }
  }

  Future<dynamic> cancelOrder(String orderId, {String? reason}) async {
    try {
      final res = await _dio.post<Object>(
        '/orders/$orderId/cancel',
        data: {if (reason != null && reason.isNotEmpty) 'reason': reason},
      );
      return res.data;
    } on DioException catch (e) {
      throw Exception(_err(e));
    }
  }

  // ─── Chat ───────────────────────────────────────────────────────────────────
  Future<dynamic> listConversations() async {
    try {
      final res = await _dio.get<Object>('/chat/conversations');
      return res.data;
    } on DioException catch (e) {
      throw Exception(_err(e));
    }
  }

  Future<dynamic> getConversation(String id) async {
    try {
      final res = await _dio.get<Object>('/chat/conversations/$id');
      return res.data;
    } on DioException catch (e) {
      throw Exception(_err(e));
    }
  }

  Future<dynamic> createDirectConversation(String providerId) async {
    try {
      final res = await _dio.post<Object>(
        '/chat/conversations/direct',
        data: {'providerId': providerId},
      );
      return res.data;
    } on DioException catch (e) {
      throw Exception(_err(e));
    }
  }

  Future<dynamic> sendMessage(
    String conversationId, {
    required String type,
    String? content,
    List<String>? fileUrls,
    List<String>? fileNames,
  }) async {
    try {
      final body = <String, dynamic>{
        'type': type,
        if (content != null) 'content': content,
        if (fileUrls != null && fileUrls.isNotEmpty) 'fileUrls': fileUrls,
        if (fileNames != null && fileNames.isNotEmpty) 'fileNames': fileNames,
      };
      final res = await _dio.post<Object>(
        '/chat/conversations/$conversationId/messages',
        data: body,
      );
      return res.data;
    } on DioException catch (e) {
      throw Exception(_err(e));
    }
  }

  Future<dynamic> getMessages(
    String conversationId, {
    int? limit,
    String? before,
  }) async {
    try {
      final res = await _dio.get<Object>(
        '/chat/conversations/$conversationId/messages',
        queryParameters: {
          if (limit != null) 'limit': limit,
          if (before != null) 'before': before,
        },
      );
      return res.data;
    } on DioException catch (e) {
      throw Exception(_err(e));
    }
  }

  Future<void> markConversationRead(String conversationId) async {
    try {
      await _dio.post<Object>('/chat/conversations/$conversationId/read');
    } on DioException catch (e) {
      throw Exception(_err(e));
    }
  }

  Future<int> chatUnreadCount() async {
    try {
      final res = await _dio.get<Object>('/chat/unread-count');
      final data = res.data;
      if (data is Map && data['count'] is num) {
        return (data['count'] as num).toInt();
      }
      return 0;
    } on DioException catch (e) {
      throw Exception(_err(e));
    }
  }

  Future<void> closeConversation(String conversationId) async {
    try {
      await _dio.post<Object>('/chat/conversations/$conversationId/close');
    } on DioException catch (e) {
      throw Exception(_err(e));
    }
  }

  Future<void> deleteConversation(String conversationId) async {
    try {
      await _dio.delete<void>('/chat/conversations/$conversationId');
    } on DioException catch (e) {
      throw Exception(_err(e));
    }
  }

  Future<dynamic> searchMessages({
    required String keyword,
    String? conversationId,
  }) async {
    try {
      final res = await _dio.get<Object>(
        '/chat/search',
        queryParameters: {
          'keyword': keyword,
          if (conversationId != null) 'conversationId': conversationId,
        },
      );
      return res.data;
    } on DioException catch (e) {
      throw Exception(_err(e));
    }
  }

  // ─── Search (public) ───────────────────────────────────────────────────────
  Future<dynamic> globalSearch(Map<String, dynamic> query) async {
    try {
      final res = await _dio.get<Object>('/search', queryParameters: query);
      return res.data;
    } on DioException catch (e) {
      throw Exception(_err(e));
    }
  }

  Future<dynamic> searchPosts(Map<String, dynamic> query) async {
    try {
      final res = await _dio.get<Object>('/search/posts', queryParameters: query);
      return res.data;
    } on DioException catch (e) {
      throw Exception(_err(e));
    }
  }

  Future<dynamic> searchProviders(Map<String, dynamic> query) async {
    try {
      final res = await _dio.get<Object>('/search/providers', queryParameters: query);
      return res.data;
    } on DioException catch (e) {
      throw Exception(_err(e));
    }
  }

  Future<dynamic> searchByProvince(Map<String, dynamic> query) async {
    try {
      final res = await _dio.get<Object>('/search/by-province', queryParameters: query);
      return res.data;
    } on DioException catch (e) {
      throw Exception(_err(e));
    }
  }

  Future<dynamic> suggestProvinces({String? q}) async {
    try {
      final res = await _dio.get<Object>(
        '/search/provinces',
        queryParameters: {if (q != null && q.isNotEmpty) 'q': q},
      );
      return res.data;
    } on DioException catch (e) {
      throw Exception(_err(e));
    }
  }

  Future<dynamic> suggestTrades({String? q, String? category}) async {
    try {
      final res = await _dio.get<Object>(
        '/search/trades',
        queryParameters: {
          if (q != null && q.isNotEmpty) 'q': q,
          if (category != null && category.isNotEmpty) 'category': category,
        },
      );
      return res.data;
    } on DioException catch (e) {
      throw Exception(_err(e));
    }
  }

  // ─── Profile (public) ─────────────────────────────────────────────────────
  Future<dynamic> getPublicProfile(String userId) async {
    try {
      final res = await _dio.get<Object>('/profile/user/$userId');
      return res.data;
    } on DioException catch (e) {
      throw Exception(_err(e));
    }
  }

  Future<dynamic> searchProfiles({
    String searchTerm = '',
    int limit = 20,
    int offset = 0,
  }) async {
    try {
      final res = await _dio.get<Object>(
        '/profile/search',
        queryParameters: {
          'searchTerm': searchTerm,
          'limit': limit,
          'offset': offset,
        },
      );
      return res.data;
    } on DioException catch (e) {
      throw Exception(_err(e));
    }
  }
}
