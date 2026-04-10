import 'package:built_collection/built_collection.dart';
import 'package:dio/dio.dart';
import 'package:openapi/openapi.dart';

class QuoteRepository {
  final QuotesApi _quotesApi;

  QuoteRepository(Openapi openapi) : _quotesApi = openapi.getQuotesApi();

  String _msg(DioException e) =>
      e.response?.data?['message']?.toString() ?? 'Quote request failed';

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

  Future<void> updateQuote(String id, UpdateQuoteDto dto) async {
    try {
      await _quotesApi.quoteControllerUpdateQuote(id: id, updateQuoteDto: dto);
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

  Future<void> cancelQuote(String id) async {
    try {
      await _quotesApi.quoteControllerCancelQuote(id: id);
    } on DioException catch (e) {
      throw Exception(_msg(e));
    }
  }

  Future<void> acceptQuote(String id) async {
    try {
      await _quotesApi.quoteControllerAcceptQuote(id: id);
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
}
