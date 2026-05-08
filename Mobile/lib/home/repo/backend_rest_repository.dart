import 'package:dio/dio.dart';
import 'package:mobile_app_doan/core/api_error_message.dart';
import 'package:mobile_app_doan/home/utils/parse_api_list.dart';

/// Gọi thẳng các route NestJS khi client OpenAPI chưa được generate đầy đủ.
/// Dùng cùng [Dio] với Openapi (interceptor refresh token vẫn áp dụng).
/// Auth (đăng ký, OTP, token) dùng [AuthRepository], không lặp ở đây.
class BackendRestRepository {
  BackendRestRepository(this._dio);

  final Dio _dio;

  // ─── Saved posts (provider) ──────────────────────────────────────────────
  Future<dynamic> savePost(String postId) async {
    try {
      final res = await _dio.post<Object>('/saved-posts', data: {'postId': postId});
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
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
      throw Exception(describeApiError(e));
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
      throw Exception(describeApiError(e));
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
      throw Exception(describeApiError(e));
    }
  }

  Future<void> unsavePost(String postId) async {
    try {
      await _dio.delete<Object>('/saved-posts/$postId');
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  // ─── Orders ───────────────────────────────────────────────────────────────
  /// Giá trị khớp [OrderStatus] backend (`order.entity.ts`).
  static const _backendOrderStatuses = <String>{
    'pending',
    'in_progress',
    'completed',
    'cancelled',
    'disputed',
  };

  /// GET /orders — backend chỉ nhận **một** query `status` (enum).
  /// Chuỗi có dấu phẩy: gọi không filter rồi lọc phía client (tránh 400 / query lặp).
  Future<dynamic> listOrders({String? status}) async {
    try {
      if (status != null && status.contains(',')) {
        final wanted = status
            .split(',')
            .map((s) => s.trim().toLowerCase())
            .where((s) => s.isNotEmpty)
            .where(_backendOrderStatuses.contains)
            .toSet();
        final res = await _dio.get<Object>('/orders');
        final all = parseObjectList(res.data);
        if (wanted.isEmpty) return all;
        return all
            .where(
              (o) => wanted.contains(
                (o['status'] ?? '').toString().toLowerCase().trim(),
              ),
            )
            .toList();
      }

      String? qStatus;
      final trimmedStatus = status?.trim();
      if (trimmedStatus != null && trimmedStatus.isNotEmpty) {
        final lower = trimmedStatus.toLowerCase();
        // Backend dùng giá trị enum dạng snake_case thường; chuẩn hóa khi khớp tập cố định.
        qStatus =
            _backendOrderStatuses.contains(lower) ? lower : trimmedStatus;
      }

      final res = await _dio.get<Object>(
        '/orders',
        queryParameters: {if (qStatus != null && qStatus.isNotEmpty) 'status': qStatus},
      );
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  Future<dynamic> orderStats() async {
    try {
      final res = await _dio.get<Object>('/orders/stats');
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  Future<dynamic> getOrder(String id) async {
    try {
      final res = await _dio.get<Object>('/orders/$id');
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  Future<dynamic> getOrderByNumber(String orderNumber) async {
    try {
      final res = await _dio.get<Object>('/orders/number/$orderNumber');
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  Future<dynamic> confirmOrderFromQuote(String quoteId) async {
    try {
      final res = await _dio.post<Object>('/orders/confirm-from-quote/$quoteId');
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  /// Customer: POST /orders/accept-quote-direct/:quoteId — tạo đơn PENDING chờ thợ xác nhận.
  Future<dynamic> acceptQuoteDirect(String quoteId) async {
    try {
      final res = await _dio.post<Object>('/orders/accept-quote-direct/$quoteId');
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  /// Provider: POST /orders/:id/provider-decline — từ chối đơn PENDING (luồng direct-accept).
  Future<dynamic> providerDeclineOrder(String orderId, {String? reason}) async {
    try {
      final res = await _dio.post<Object>(
        '/orders/$orderId/provider-decline',
        data: {if (reason != null && reason.isNotEmpty) 'reason': reason},
      );
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  /// Provider: GET /orders/awaiting-my-confirmation — đơn PENDING chờ xác nhận / từ chối.
  Future<dynamic> listOrdersAwaitingConfirmation({int page = 1, int limit = 10}) async {
    try {
      final res = await _dio.get<Object>(
        '/orders/awaiting-my-confirmation',
        queryParameters: {'page': page, 'limit': limit},
      );
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  Future<dynamic> providerCompleteOrder(String orderId) async {
    try {
      final res = await _dio.post<Object>('/orders/$orderId/provider-complete');
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  Future<dynamic> customerCompleteOrder(String orderId) async {
    try {
      final res = await _dio.post<Object>('/orders/$orderId/customer-complete');
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
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
      throw Exception(describeApiError(e));
    }
  }

  // ─── Chat ───────────────────────────────────────────────────────────────────
  Future<dynamic> listConversations() async {
    try {
      final res = await _dio.get<Object>('/chat/conversations');
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  Future<dynamic> getConversation(String id) async {
    try {
      final res = await _dio.get<Object>('/chat/conversations/$id');
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
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
      throw Exception(describeApiError(e));
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
      throw Exception(describeApiError(e));
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
      throw Exception(describeApiError(e));
    }
  }

  Future<void> markConversationRead(String conversationId) async {
    try {
      await _dio.post<Object>('/chat/conversations/$conversationId/read');
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
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
      throw Exception(describeApiError(e));
    }
  }

  Future<void> closeConversation(String conversationId) async {
    try {
      await _dio.post<Object>('/chat/conversations/$conversationId/close');
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  Future<void> deleteConversation(String conversationId) async {
    try {
      await _dio.delete<void>('/chat/conversations/$conversationId');
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
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
      throw Exception(describeApiError(e));
    }
  }

  // ─── Search (public) ───────────────────────────────────────────────────────
  Future<dynamic> globalSearch(Map<String, dynamic> query) async {
    try {
      final res = await _dio.get<Object>('/search', queryParameters: query);
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  Future<dynamic> searchPosts(Map<String, dynamic> query) async {
    try {
      final res = await _dio.get<Object>('/search/posts', queryParameters: query);
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  Future<dynamic> searchProviders(Map<String, dynamic> query) async {
    try {
      final res = await _dio.get<Object>('/search/providers', queryParameters: query);
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  Future<dynamic> searchByProvince(Map<String, dynamic> query) async {
    try {
      final res = await _dio.get<Object>('/search/by-province', queryParameters: query);
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
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
      throw Exception(describeApiError(e));
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
      throw Exception(describeApiError(e));
    }
  }

  // ─── Profile (public) ─────────────────────────────────────────────────────
  Future<dynamic> getPublicProfile(String userId) async {
    try {
      final res = await _dio.get<Object>('/profile/user/$userId');
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
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
      throw Exception(describeApiError(e));
    }
  }

  // ─── Custom requests (backend `custom-requests`) ─────────────────────────
  Future<dynamic> createCustomRequest(Map<String, dynamic> body) async {
    try {
      final res = await _dio.post<Object>('/custom-requests', data: body);
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  Future<dynamic> acceptCustomRequest(String id, Map<String, dynamic> body) async {
    try {
      final res = await _dio.post<Object>('/custom-requests/$id/accept', data: body);
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  Future<dynamic> rejectCustomRequest(String id, {String? reason}) async {
    try {
      final res = await _dio.post<Object>(
        '/custom-requests/$id/reject',
        data: {if (reason != null && reason.isNotEmpty) 'reason': reason},
      );
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  Future<dynamic> getCustomRequestQuote(String id) async {
    try {
      final res = await _dio.get<Object>('/custom-requests/$id/quote');
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  Future<dynamic> listMySentCustomRequests({String? status, int? page, int? limit}) async {
    try {
      final res = await _dio.get<Object>(
        '/custom-requests/my/sent',
        queryParameters: {
          if (status != null && status.isNotEmpty) 'status': status,
          if (page != null) 'page': page,
          if (limit != null) 'limit': limit,
        },
      );
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  Future<dynamic> listMyReceivedCustomRequests({String? status, int? page, int? limit}) async {
    try {
      final res = await _dio.get<Object>(
        '/custom-requests/my/received',
        queryParameters: {
          if (status != null && status.isNotEmpty) 'status': status,
          if (page != null) 'page': page,
          if (limit != null) 'limit': limit,
        },
      );
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  Future<dynamic> getCustomRequest(String id) async {
    try {
      final res = await _dio.get<Object>('/custom-requests/$id');
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  Future<dynamic> deleteCustomRequest(String id) async {
    try {
      final res = await _dio.delete<Object>('/custom-requests/$id');
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  // ─── Reviews ──────────────────────────────────────────────────────────────
  Future<dynamic> createReview({
    required String orderId,
    required int rating,
    String? comment,
    bool isPublic = true,
  }) async {
    try {
      final res = await _dio.post<Object>('/reviews', data: {
        'orderId': orderId,
        'rating': rating,
        if (comment != null && comment.isNotEmpty) 'comment': comment,
        'isPublic': isPublic,
      });
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  Future<dynamic> addProviderReply(String reviewId, String reply) async {
    try {
      final res = await _dio.post<Object>('/reviews/$reviewId/reply', data: {'reply': reply});
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  Future<dynamic> getProviderReviews(String providerId, {int page = 1, int limit = 10}) async {
    try {
      final res = await _dio.get<Object>(
        '/reviews/provider/$providerId',
        queryParameters: {'page': page, 'limit': limit},
      );
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  Future<dynamic> getOrderReview(String orderId) async {
    try {
      final res = await _dio.get<Object>('/reviews/order/$orderId');
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  Future<dynamic> getMyReviews({int page = 1, int limit = 10}) async {
    try {
      final res = await _dio.get<Object>(
        '/reviews/my',
        queryParameters: {'page': page, 'limit': limit},
      );
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  // ─── Certifications ───────────────────────────────────────────────────────
  Future<dynamic> getMyCertifications() async {
    try {
      final res = await _dio.get<Object>('/certifications/my');
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  Future<dynamic> getProviderCertifications(String providerId) async {
    try {
      final res = await _dio.get<Object>('/certifications/provider/$providerId');
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  Future<dynamic> deleteCertification(String id) async {
    try {
      final res = await _dio.delete<Object>('/certifications/$id');
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  Future<dynamic> uploadCertification(
    List<int> fileBytes,
    String fileName,
    String title, {
    String? issuingOrganization,
    String? issueDate,
    String? expiryDate,
  }) async {
    try {
      final formData = FormData.fromMap({
        'file': MultipartFile.fromBytes(fileBytes, filename: fileName),
        'title': title,
        if (issuingOrganization != null && issuingOrganization.isNotEmpty)
          'issuingOrganization': issuingOrganization,
        if (issueDate != null && issueDate.isNotEmpty) 'issueDate': issueDate,
        if (expiryDate != null && expiryDate.isNotEmpty) 'expiryDate': expiryDate,
      });
      final res = await _dio.post<Object>(
        '/certifications',
        data: formData,
        options: Options(contentType: 'multipart/form-data'),
      );
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  // ─── Subscription ─────────────────────────────────────────────────────────
  Future<dynamic> getSubscriptionPlans() async {
    try {
      final res = await _dio.get<Object>('/subscription/plans');
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  Future<dynamic> getMySubscription() async {
    try {
      final res = await _dio.get<Object>('/subscription/my');
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  Future<dynamic> getMySubscriptionStatus() async {
    try {
      final res = await _dio.get<Object>('/subscription/my/status');
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  Future<dynamic> subscribe(String planId, {String? discountCode}) async {
    try {
      final res = await _dio.post<Object>('/subscription/subscribe', data: {
        'planId': planId,
        if (discountCode != null && discountCode.isNotEmpty) 'discountCode': discountCode,
      });
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  Future<dynamic> cancelSubscription({String? reason}) async {
    try {
      final res = await _dio.patch<Object>(
        '/subscription/cancel',
        data: {if (reason != null && reason.isNotEmpty) 'reason': reason},
      );
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  Future<dynamic> getMySubscriptionPayments({int page = 1, int limit = 20}) async {
    try {
      final res = await _dio.get<Object>(
        '/subscription/my/payments',
        queryParameters: {'page': page, 'limit': limit},
      );
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  Future<dynamic> cancelPendingSubscriptionPayment() async {
    try {
      final res = await _dio.delete<Object>('/subscription/my/payments/pending');
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  Future<dynamic> validateDiscountCode(String code, String billingCycle) async {
    try {
      final res = await _dio.post<Object>('/subscription/discounts/validate', data: {
        'code': code,
        'billingCycle': billingCycle,
      });
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }
}
