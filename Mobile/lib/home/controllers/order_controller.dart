import 'package:get/get.dart';
import 'package:mobile_app_doan/core/api_error_message.dart';
import 'package:mobile_app_doan/home/repo/backend_rest_repository.dart';
import 'package:mobile_app_doan/home/utils/parse_api_list.dart';

class OrderController extends GetxController {
  OrderController(this._api);

  final BackendRestRepository _api;

  final isLoading = false.obs;
  final errorMessage = ''.obs;
  final orders = <Map<String, dynamic>>[].obs;
  final stats = Rxn<Map<String, dynamic>>();

  Future<void> loadOrders({String? status}) async {
    isLoading.value = true;
    errorMessage.value = '';
    try {
      final raw = await _api.listOrders(status: status);
      orders.assignAll(parseObjectList(raw));
    } catch (e) {
      errorMessage.value = describeApiError(e);
      orders.clear();
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> loadStats() async {
    try {
      final raw = await _api.orderStats();
      if (raw is Map) {
        stats.value = Map<String, dynamic>.from(raw);
      }
    } catch (_) {
      stats.value = null;
    }
  }

  Future<Map<String, dynamic>?> fetchOrder(String id) async {
    try {
      final raw = await _api.getOrder(id);
      if (raw is Map) return Map<String, dynamic>.from(raw);
    } catch (e) {
      Get.snackbar('Lỗi', describeApiError(e));
    }
    return null;
  }

  Future<void> providerComplete(String orderId) async {
    try {
      await _api.providerCompleteOrder(orderId);
      Get.snackbar('Thành công', 'Đã xác nhận hoàn thành phía thợ');
      await loadOrders();
    } catch (e) {
      Get.snackbar('Lỗi', describeApiError(e));
    }
  }

  Future<void> customerComplete(String orderId) async {
    try {
      await _api.customerCompleteOrder(orderId);
      Get.snackbar('Thành công', 'Đơn hàng đã hoàn tất');
      await loadOrders();
    } catch (e) {
      Get.snackbar('Lỗi', describeApiError(e));
    }
  }

  Future<void> cancel(String orderId, {String? reason}) async {
    try {
      await _api.cancelOrder(orderId, reason: reason);
      Get.snackbar('Đã hủy', 'Đơn hàng đã được hủy');
      await loadOrders();
    } catch (e) {
      Get.snackbar('Lỗi', describeApiError(e));
    }
  }

  Future<void> confirmFromQuote(String quoteId) async {
    try {
      await _api.confirmOrderFromQuote(quoteId);
      Get.snackbar('Thành công', 'Đã tạo đơn từ báo giá');
      await loadOrders();
    } catch (e) {
      Get.snackbar('Lỗi', describeApiError(e));
    }
  }

  /// Khách chấp nhận giá báo ngay → đơn PENDING chờ thợ xác nhận.
  Future<void> acceptQuoteDirect(String quoteId) async {
    try {
      isLoading.value = true;
      await _api.acceptQuoteDirect(quoteId);
      Get.snackbar('Thành công', 'Đã tạo đơn. Thợ sẽ xác nhận để bắt đầu.');
      await loadOrders();
    } catch (e) {
      Get.snackbar('Lỗi', describeApiError(e));
    } finally {
      isLoading.value = false;
    }
  }

  /// Thợ từ chối đơn PENDING (sau khi khách accept-quote-direct).
  Future<void> providerDecline(String orderId, {String? reason}) async {
    try {
      await _api.providerDeclineOrder(orderId, reason: reason);
      Get.snackbar('Đã cập nhật', 'Đã từ chối đơn hàng');
      await loadOrders();
    } catch (e) {
      Get.snackbar('Lỗi', describeApiError(e));
    }
  }

  Future<Map<String, dynamic>?> fetchAwaitingConfirmation({int page = 1, int limit = 10}) async {
    try {
      final raw = await _api.listOrdersAwaitingConfirmation(page: page, limit: limit);
      if (raw is Map) return Map<String, dynamic>.from(raw);
    } catch (e) {
      Get.snackbar('Lỗi', describeApiError(e));
    }
    return null;
  }
}
