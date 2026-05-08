import 'package:built_collection/built_collection.dart';
import 'package:dio/dio.dart';
import 'package:mobile_app_doan/core/api_error_message.dart';
import 'package:openapi/openapi.dart';

class QuoteRepository {
  QuoteRepository(Openapi openapi)
      : _quotesApi = openapi.getQuotesApi(),
        _dio = openapi.dio;

  final QuotesApi _quotesApi;
  final Dio _dio;

  Map<String, dynamic> _updateQuoteBody(UpdateQuoteDto dto) {
    return <String, dynamic>{
      if (dto.price != null) 'price': dto.price,
      if (dto.description != null) 'description': dto.description,
      if (dto.terms != null) 'terms': dto.terms,
      if (dto.estimatedDuration != null) 'estimatedDuration': dto.estimatedDuration,
      if (dto.imageUrls != null && dto.imageUrls!.isNotEmpty)
        'imageUrls': dto.imageUrls!.toList(),
    };
  }

  Future<void> createNewQuote(CreateQuoteDto newQuote) async {
    try {
      await _quotesApi.quoteControllerCreateQuote(createQuoteDto: newQuote);
    } on DioException catch (e) {
      throw Exception(describeApiError(e, fallback: 'Quote request failed'));
    }
  }

  Future<dynamic> getPostQuotes(String postId) async {
    try {
      final res = await _quotesApi.quoteControllerGetPostQuotes(postId: postId);
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e, fallback: 'Quote request failed'));
    }
  }

  /// GET /quotes/custom-request/:customRequestId (báo giá cho yêu cầu riêng).
  Future<dynamic> getQuotesForCustomRequest(String customRequestId) async {
    try {
      final res = await _dio.get<Object>('/quotes/custom-request/$customRequestId');
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e, fallback: 'Quote request failed'));
    }
  }

  Future<dynamic> getMyQuotes({
    String? postId,
    num? price,
    String? description,
    String? terms,
    num? estimatedDuration,
    BuiltList<String>? imageUrls,
    String? status,
  }) async {
    try {
      final res = await _quotesApi.quoteControllerGetMyQuotes(
        postId: postId,
        price: price,
        description: description,
        terms: terms,
        estimatedDuration: estimatedDuration,
        imageUrls: imageUrls,
        status: status,
      );
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e, fallback: 'Quote request failed'));
    }
  }

  Future<dynamic> getQuoteById(String id) async {
    try {
      final res = await _quotesApi.quoteControllerGetQuoteById(id: id);
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e, fallback: 'Quote request failed'));
    }
  }

  /// Backend: PATCH /quotes/:id (OpenAPI client dùng PUT — không khớp).
  Future<void> updateQuote(String id, UpdateQuoteDto dto) async {
    try {
      await _dio.patch<Object>('/quotes/$id', data: _updateQuoteBody(dto));
    } on DioException catch (e) {
      throw Exception(describeApiError(e, fallback: 'Quote request failed'));
    }
  }

  Future<void> deleteQuote(String id) async {
    try {
      await _quotesApi.quoteControllerDeleteQuote(id: id);
    } on DioException catch (e) {
      throw Exception(describeApiError(e, fallback: 'Quote request failed'));
    }
  }

  Future<void> cancelQuote(String id, {String? reason}) async {
    try {
      await _dio.post<Object>(
        '/quotes/$id/cancel',
        data: {if (reason != null && reason.isNotEmpty) 'reason': reason},
      );
    } on DioException catch (e) {
      throw Exception(describeApiError(e, fallback: 'Quote request failed'));
    }
  }

  /// Backend: POST /quotes/:id/accept-for-chat (OpenAPI vẫn là /accept).
  Future<void> acceptQuote(String id) async {
    try {
      await _dio.post<Object>('/quotes/$id/accept-for-chat');
    } on DioException catch (e) {
      throw Exception(describeApiError(e, fallback: 'Quote request failed'));
    }
  }

  Future<void> rejectQuote(String id, RejectQuoteDto dto) async {
    try {
      await _quotesApi.quoteControllerRejectQuote(id: id, rejectQuoteDto: dto);
    } on DioException catch (e) {
      throw Exception(describeApiError(e, fallback: 'Quote request failed'));
    }
  }

  /// Provider: POST /quotes/:id/revise
  Future<void> reviseQuote(
    String id, {
    required num price,
    String? description,
    String? terms,
    num? estimatedDuration,
    String? changeReason,
  }) async {
    try {
      await _dio.post<Object>(
        '/quotes/$id/revise',
        data: <String, dynamic>{
          'price': price,
          if (description != null) 'description': description,
          if (terms != null) 'terms': terms,
          if (estimatedDuration != null) 'estimatedDuration': estimatedDuration,
          if (changeReason != null) 'changeReason': changeReason,
        },
      );
    } on DioException catch (e) {
      throw Exception(describeApiError(e, fallback: 'Quote request failed'));
    }
  }

  /// Customer: POST /quotes/:id/request-order
  Future<void> requestOrder(String id) async {
    try {
      await _dio.post<Object>('/quotes/$id/request-order');
    } on DioException catch (e) {
      throw Exception(describeApiError(e, fallback: 'Quote request failed'));
    }
  }

  /// Customer: POST /orders/accept-quote-direct/:quoteId — chấp nhận giá ngay, tạo đơn PENDING (chỉ quote PENDING).
  Future<dynamic> acceptQuoteDirect(String quoteId) async {
    try {
      final res = await _dio.post<Object>('/orders/accept-quote-direct/$quoteId');
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e, fallback: 'Quote request failed'));
    }
  }

  /// GET /quotes/:id/with-revisions
  Future<dynamic> getQuoteWithRevisions(String id) async {
    try {
      final res = await _dio.get<Object>('/quotes/$id/with-revisions');
      return res.data;
    } on DioException catch (e) {
      throw Exception(describeApiError(e, fallback: 'Quote request failed'));
    }
  }
}
