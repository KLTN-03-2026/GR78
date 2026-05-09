import 'package:get/get.dart';
import 'package:mobile_app_doan/core/api_error_message.dart';
import 'package:mobile_app_doan/home/repo/backend_rest_repository.dart';
import 'package:mobile_app_doan/home/utils/parse_api_list.dart';

class SubscriptionController extends GetxController {
  SubscriptionController(this._api);

  final BackendRestRepository _api;

  final isLoading = false.obs;
  final plans = <Map<String, dynamic>>[].obs;
  final subscription = Rxn<Map<String, dynamic>>();
  final subscriptionStatus = Rxn<Map<String, dynamic>>();
  final payments = <Map<String, dynamic>>[].obs;

  @override
  void onInit() {
    super.onInit();
    loadPlans();
  }

  Future<void> loadPlans() async {
    try {
      final raw = await _api.getSubscriptionPlans();
      if (raw is List) {
        plans.assignAll(raw.whereType<Map>().map((e) => Map<String, dynamic>.from(e)));
      }
    } catch (_) {}
  }

  Future<void> loadMySubscription() async {
    isLoading.value = true;
    try {
      final raw = await _api.getMySubscription();
      if (raw is Map) subscription.value = Map<String, dynamic>.from(raw);
    } catch (_) {
      subscription.value = null;
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> loadMySubscriptionStatus() async {
    try {
      final raw = await _api.getMySubscriptionStatus();
      if (raw is Map) subscriptionStatus.value = Map<String, dynamic>.from(raw);
    } catch (_) {
      subscriptionStatus.value = null;
    }
  }

  Future<void> loadMyPayments({int page = 1}) async {
    isLoading.value = true;
    try {
      final raw = await _api.getMySubscriptionPayments(page: page);
      if (raw is Map) {
        payments.assignAll(parseObjectList(raw['payments']));
      }
    } catch (e) {
      Get.snackbar('Lỗi', describeApiError(e));
    } finally {
      isLoading.value = false;
    }
  }

  Future<bool> subscribe(String planId, {String? discountCode}) async {
    isLoading.value = true;
    try {
      await _api.subscribe(planId, discountCode: discountCode);
      Get.snackbar('Thành công', 'Đã tạo yêu cầu thanh toán. Admin sẽ xác nhận sớm.');
      await loadMySubscription();
      await loadMySubscriptionStatus();
      return true;
    } catch (e) {
      Get.snackbar('Lỗi', describeApiError(e));
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  Future<bool> cancelSubscription({String? reason}) async {
    isLoading.value = true;
    try {
      await _api.cancelSubscription(reason: reason);
      Get.snackbar('Đã hủy', 'Gói dịch vụ sẽ hết hạn vào cuối chu kỳ hiện tại.');
      await loadMySubscription();
      await loadMySubscriptionStatus();
      return true;
    } catch (e) {
      Get.snackbar('Lỗi', describeApiError(e));
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  Future<bool> cancelPendingPayment() async {
    try {
      await _api.cancelPendingSubscriptionPayment();
      Get.snackbar('Đã hủy', 'Thanh toán đang chờ đã được hủy.');
      await loadMySubscription();
      return true;
    } catch (e) {
      Get.snackbar('Lỗi', describeApiError(e));
      return false;
    }
  }

  Future<Map<String, dynamic>?> validateDiscount(String code, String billingCycle) async {
    try {
      final raw = await _api.validateDiscountCode(code, billingCycle);
      if (raw is Map) return Map<String, dynamic>.from(raw);
    } catch (e) {
      Get.snackbar('Lỗi', describeApiError(e));
    }
    return null;
  }
}
