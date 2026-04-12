import 'package:get/get.dart';
import 'package:mobile_app_doan/home/repo/quote_repository.dart';
import 'package:mobile_app_doan/home/utils/parse_api_list.dart';
import 'package:openapi/openapi.dart';

class QuoteController extends GetxController {
  final QuoteRepository repository;
  QuoteController(this.repository);

  final isLoading = false.obs;
  final errorMessage = ''.obs;

  final postQuotes = <Map<String, dynamic>>[].obs;
  final myQuotes = <Map<String, dynamic>>[].obs;

  Future<bool> createQuote(CreateQuoteDto content) async {
    try {
      isLoading.value = true;
      errorMessage.value = '';

      await repository.createNewQuote(content);
      Get.snackbar('Thành công', 'Đã gửi báo giá');
      return true;
    } catch (e) {
      final message = e.toString().replaceAll('Exception: ', '');
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
      errorMessage.value = e.toString();
      postQuotes.clear();
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
      errorMessage.value = e.toString();
      myQuotes.clear();
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> acceptQuote(String id) async {
    try {
      isLoading.value = true;
      await repository.acceptQuote(id);
      Get.snackbar('Thành công', 'Đã chấp nhận báo giá');
    } catch (e) {
      Get.snackbar('Lỗi', e.toString());
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
      Get.snackbar('Lỗi', e.toString());
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
      Get.snackbar('Lỗi', e.toString());
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
      Get.snackbar('Lỗi', e.toString());
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> cancelQuoteById(String id) async {
    try {
      isLoading.value = true;
      await repository.cancelQuote(id);
      await loadMyQuotes();
      Get.snackbar('Thành công', 'Đã hủy báo giá');
    } catch (e) {
      Get.snackbar('Lỗi', e.toString());
    } finally {
      isLoading.value = false;
    }
  }
}
