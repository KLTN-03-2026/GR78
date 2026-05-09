import 'package:get/get.dart';
import 'package:mobile_app_doan/core/api_error_message.dart';
import 'package:mobile_app_doan/home/repo/backend_rest_repository.dart';
import 'package:mobile_app_doan/home/utils/parse_api_list.dart';

class ReviewController extends GetxController {
  ReviewController(this._api);

  final BackendRestRepository _api;

  final isLoading = false.obs;
  final reviews = <Map<String, dynamic>>[].obs;
  final currentReview = Rxn<Map<String, dynamic>>();
  int total = 0;
  double? averageRating;

  Future<void> loadMyReviews({int page = 1}) async {
    isLoading.value = true;
    try {
      final raw = await _api.getMyReviews(page: page);
      if (raw is Map) {
        reviews.assignAll(parseObjectList(raw['data']));
        total = (raw['total'] as num?)?.toInt() ?? 0;
        averageRating = (raw['averageRating'] as num?)?.toDouble();
      }
    } catch (e) {
      Get.snackbar('Lỗi', describeApiError(e));
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> loadProviderReviews(String providerId, {int page = 1}) async {
    isLoading.value = true;
    try {
      final raw = await _api.getProviderReviews(providerId, page: page);
      if (raw is Map) {
        reviews.assignAll(parseObjectList(raw['data']));
        total = (raw['total'] as num?)?.toInt() ?? 0;
        averageRating = (raw['averageRating'] as num?)?.toDouble();
      }
    } catch (e) {
      Get.snackbar('Lỗi', describeApiError(e));
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> loadOrderReview(String orderId) async {
    isLoading.value = true;
    try {
      final raw = await _api.getOrderReview(orderId);
      if (raw is Map) currentReview.value = Map<String, dynamic>.from(raw);
    } catch (_) {
      currentReview.value = null;
    } finally {
      isLoading.value = false;
    }
  }

  Future<bool> createReview({
    required String orderId,
    required int rating,
    String? comment,
    bool isPublic = true,
  }) async {
    isLoading.value = true;
    try {
      await _api.createReview(
        orderId: orderId,
        rating: rating,
        comment: comment,
        isPublic: isPublic,
      );
      Get.snackbar('Thành công', 'Đã gửi đánh giá');
      return true;
    } catch (e) {
      Get.snackbar('Lỗi', describeApiError(e));
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  Future<bool> addReply(String reviewId, String reply) async {
    isLoading.value = true;
    try {
      await _api.addProviderReply(reviewId, reply);
      Get.snackbar('Thành công', 'Đã phản hồi đánh giá');
      return true;
    } catch (e) {
      Get.snackbar('Lỗi', describeApiError(e));
      return false;
    } finally {
      isLoading.value = false;
    }
  }
}
