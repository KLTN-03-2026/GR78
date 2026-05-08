import 'package:get/get.dart';
import 'package:mobile_app_doan/core/api_error_message.dart';
import 'package:mobile_app_doan/home/repo/quote_repository.dart';
import 'package:mobile_app_doan/home/utils/parse_api_list.dart';
import 'package:openapi/openapi.dart';

class QuoteController extends GetxController {
  final QuoteRepository repository;
  QuoteController(this.repository);

  final isLoading = false.obs;
  final errorMessage = ''.obs;

  final postQuotes = <Map<String, dynamic>>[].obs;
  final customRequestQuotes = <Map<String, dynamic>>[].obs;
  final myQuotes = <Map<String, dynamic>>[].obs;

  Future<bool> createQuote(CreateQuoteDto content) async {
    try {
      isLoading.value = true;
      errorMessage.value = '';

      await repository.createNewQuote(content);
      Get.snackbar('Thành công', 'Đã gửi báo giá');
      return true;
    } catch (e) {
      final message = describeApiError(e);
      errorMessage.value = message;
      Get.snackbar('Lỗi', message);
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> loadPostQuotes(String postId) async {
    try {
      isLoading.value = true;
      errorMessage.value = '';
      final raw = await repository.getPostQuotes(postId);
      postQuotes.assignAll(parseObjectList(raw));
    } catch (e) {
      errorMessage.value = describeApiError(e);
      postQuotes.clear();
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> loadQuotesForCustomRequest(String customRequestId) async {
    try {
      isLoading.value = true;
      errorMessage.value = '';
      final raw = await repository.getQuotesForCustomRequest(customRequestId);
      customRequestQuotes.assignAll(parseObjectList(raw));
    } catch (e) {
      errorMessage.value = describeApiError(e);
      customRequestQuotes.clear();
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> loadMyQuotes() async {
    try {
      isLoading.value = true;
      errorMessage.value = '';
      final raw = await repository.getMyQuotes();
      myQuotes.assignAll(parseObjectList(raw));
    } catch (e) {
      errorMessage.value = describeApiError(e);
      myQuotes.clear();
    } finally {
      isLoading.value = false;
    }
  }

  Future<bool> acceptQuote(String id) async {
    try {
      isLoading.value = true;
      await repository.acceptQuote(id);
      Get.snackbar('Thành công', 'Đã mở chat — trao đổi thêm với thợ');
      return true;
    } catch (e) {
      Get.snackbar('Lỗi', describeApiError(e));
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /// Khách: chấp nhận giá ngay (quote PENDING) → tạo đơn chờ thợ xác nhận.
  Future<bool> acceptQuoteDirect(String id) async {
    try {
      isLoading.value = true;
      await repository.acceptQuoteDirect(id);
      Get.snackbar('Thành công', 'Đã tạo đơn hàng. Thợ sẽ xác nhận sớm.');
      return true;
    } catch (e) {
      Get.snackbar('Lỗi', describeApiError(e));
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> rejectQuote(String id, {String? reason}) async {
    try {
      isLoading.value = true;
      final dto = RejectQuoteDto(
        (b) => b..reason = reason,
      );
      await repository.rejectQuote(id, dto);
      Get.snackbar('Thành công', 'Đã từ chối báo giá');
    } catch (e) {
      Get.snackbar('Lỗi', describeApiError(e));
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> updateQuote(String id, UpdateQuoteDto dto) async {
    try {
      isLoading.value = true;
      await repository.updateQuote(id, dto);
      Get.snackbar('Thành công', 'Đã cập nhật báo giá');
    } catch (e) {
      Get.snackbar('Lỗi', describeApiError(e));
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> deleteQuoteById(String id) async {
    try {
      isLoading.value = true;
      await repository.deleteQuote(id);
      myQuotes.removeWhere(
        (q) => (q['id'] ?? q['_id'])?.toString() == id,
      );
      Get.snackbar('Thành công', 'Đã xóa báo giá');
    } catch (e) {
      Get.snackbar('Lỗi', describeApiError(e));
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> cancelQuoteById(String id, {String? reason}) async {
    try {
      isLoading.value = true;
      await repository.cancelQuote(id, reason: reason);
      await loadMyQuotes();
      Get.snackbar('Thành công', 'Đã hủy báo giá');
    } catch (e) {
      Get.snackbar('Lỗi', describeApiError(e));
    } finally {
      isLoading.value = false;
    }
  }

  /// Thợ: chào giá lại sau khi đã mở chat (POST /quotes/:id/revise).
  Future<void> reviseQuote(
    String id, {
    required num price,
    String? description,
    String? terms,
    num? estimatedDuration,
    String? changeReason,
  }) async {
    try {
      isLoading.value = true;
      await repository.reviseQuote(
        id,
        price: price,
        description: description,
        terms: terms,
        estimatedDuration: estimatedDuration,
        changeReason: changeReason,
      );
      Get.snackbar('Thành công', 'Đã gửi báo giá mới');
    } catch (e) {
      Get.snackbar('Lỗi', describeApiError(e));
    } finally {
      isLoading.value = false;
    }
  }

  /// Khách: sau khi đã trao đổi — yêu cầu đặt đơn theo giá hiện tại (POST /quotes/:id/request-order).
  Future<bool> requestOrder(String id) async {
    try {
      isLoading.value = true;
      await repository.requestOrder(id);
      Get.snackbar('Thành công', 'Đã gửi yêu cầu đặt đơn. Thợ sẽ xác nhận.');
      return true;
    } catch (e) {
      Get.snackbar('Lỗi', describeApiError(e));
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  Future<dynamic> fetchQuoteWithRevisions(String id) async {
    try {
      isLoading.value = true;
      return await repository.getQuoteWithRevisions(id);
    } catch (e) {
      Get.snackbar('Lỗi', describeApiError(e));
      rethrow;
    } finally {
      isLoading.value = false;
    }
  }
}
