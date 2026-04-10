import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for QuotesApi
void main() {
  final instance = Openapi().getQuotesApi();

  group(QuotesApi, () {
    // Accepted quote (Customer)
    //
    //Future quoteControllerAcceptQuote(String id) async
    test('test quoteControllerAcceptQuote', () async {
      // TODO
    });

    // Cancel quote (Worker)
    //
    //Future quoteControllerCancelQuote(String id) async
    test('test quoteControllerCancelQuote', () async {
      // TODO
    });

    // Create new quote (Worker)
    //
    //Future quoteControllerCreateQuote(CreateQuoteDto createQuoteDto) async
    test('test quoteControllerCreateQuote', () async {
      // TODO
    });

    // Delete quote (Worker)
    //
    //Future quoteControllerDeleteQuote(String id) async
    test('test quoteControllerDeleteQuote', () async {
      // TODO
    });

    // Get my quote list (Worker)
    //
    //Future quoteControllerGetMyQuotes({ String postId, num price, String description, String terms, num estimatedDuration, BuiltList<String> imageUrls, String status }) async
    test('test quoteControllerGetMyQuotes', () async {
      // TODO
    });

    // Get post bids (Customer)
    //
    //Future quoteControllerGetPostQuotes(String postId) async
    test('test quoteControllerGetPostQuotes', () async {
      // TODO
    });

    // See detailed quote
    //
    //Future quoteControllerGetQuoteById(String id) async
    test('test quoteControllerGetQuoteById', () async {
      // TODO
    });

    // Refused to bid (Customer)
    //
    //Future quoteControllerRejectQuote(String id, RejectQuoteDto rejectQuoteDto) async
    test('test quoteControllerRejectQuote', () async {
      // TODO
    });

    // Update price quote (Worker)
    //
    //Future quoteControllerUpdateQuote(String id, UpdateQuoteDto updateQuoteDto) async
    test('test quoteControllerUpdateQuote', () async {
      // TODO
    });

  });
}
