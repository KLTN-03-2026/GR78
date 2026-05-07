import 'package:built_collection/built_collection.dart';
import 'package:dio/dio.dart';
import 'package:openapi/openapi.dart';

class QuoteRepository {
  QuoteRepository(Openapi openapi)
      : _quotesApi = openapi.getQuotesApi(),
        _dio = openapi.dio;

  final QuotesApi _quotesApi;
  final Dio _dio;

  String _msg(DioException e) =>
      e.response?.data?['message']?.toString() ?? 'Quote request failed';

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
      throw Exception(_msg(e));
    }
  }

  Future<dynamic> getPostQuotes(String postId) async {
    try {
      final res = await _quotesApi.quoteControllerGetPostQuotes(postId: postId);
      return res.data;
    } on DioException catch (e) {
      throw Exception(_msg(e));
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
      throw Exception(_msg(e));
    }
  }

  Future<dynamic> getQuoteById(String id) async {
    try {
      final res = await _quotesApi.quoteControllerGetQuoteById(id: id);
      return res.data;
    } on DioException catch (e) {
      throw Exception(_msg(e));
    }
  }

  /// Backend: PATCH /quotes/:id (OpenAPI client dùng PUT — không khớp).
  Future<void> updateQuote(String id, UpdateQuoteDto dto) async {
    try {
      await _dio.patch<Object>('/quotes/$id', data: _updateQuoteBody(dto));
    } on DioException catch (e) {
      throw Exception(_msg(e));
    }
  }

  Future<void> deleteQuote(String id) async {
    try {
      await _quotesApi.quoteControllerDeleteQuote(id: id);
    } on DioException catch (e) {
      throw Exception(_msg(e));
    }
  }

  Future<void> cancelQuote(String id, {String? reason}) async {
    try {
      await _dio.post<Object>(
        '/quotes/$id/cancel',
        data: {if (reason != null && reason.isNotEmpty) 'reason': reason},
      );
    } on DioException catch (e) {
      throw Exception(_msg(e));
    }
  }

  /// Backend: POST /quotes/:id/accept-for-chat (OpenAPI vẫn là /accept).
  Future<void> acceptQuote(String id) async {
    try {
      await _dio.post<Object>('/quotes/$id/accept-for-chat');
    } on DioException catch (e) {
      throw Exception(_msg(e));
    }
  }

  Future<void> rejectQuote(String id, RejectQuoteDto dto) async {
    try {
      await _quotesApi.quoteControllerRejectQuote(id: id, rejectQuoteDto: dto);
    } on DioException catch (e) {
      throw Exception(_msg(e));
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
      throw Exception(_msg(e));
    }
  }

  /// Customer: POST /quotes/:id/request-order
  Future<void> requestOrder(String id) async {
    try {
      await _dio.post<Object>('/quotes/$id/request-order');
    } on DioException catch (e) {
      throw Exception(_msg(e));
    }
  }

  /// GET /quotes/:id/with-revisions
  Future<dynamic> getQuoteWithRevisions(String id) async {
    try {
      final res = await _dio.get<Object>('/quotes/$id/with-revisions');
      return res.data;
    } on DioException catch (e) {
      throw Exception(_msg(e));
    }
  }
}
