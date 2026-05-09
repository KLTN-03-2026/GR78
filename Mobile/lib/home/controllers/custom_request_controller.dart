import 'package:get/get.dart';
import 'package:mobile_app_doan/core/api_error_message.dart';
import 'package:mobile_app_doan/home/repo/backend_rest_repository.dart';
import 'package:mobile_app_doan/home/utils/parse_api_list.dart';

class CustomRequestController extends GetxController {
  CustomRequestController(this._api);

  final BackendRestRepository _api;

  final isLoading = false.obs;
  final sentRequests = <Map<String, dynamic>>[].obs;
  final receivedRequests = <Map<String, dynamic>>[].obs;

  Future<void> loadSentRequests({String? status}) async {
    isLoading.value = true;
    try {
      final raw = await _api.listMySentCustomRequests(status: status);
      if (raw is Map) sentRequests.assignAll(parseObjectList(raw['data']));
    } catch (e) {
      Get.snackbar('Lỗi', describeApiError(e));
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> loadReceivedRequests({String? status}) async {
    isLoading.value = true;
    try {
      final raw = await _api.listMyReceivedCustomRequests(status: status);
      if (raw is Map) receivedRequests.assignAll(parseObjectList(raw['data']));
    } catch (e) {
      Get.snackbar('Lỗi', describeApiError(e));
    } finally {
      isLoading.value = false;
    }
  }

  Future<Map<String, dynamic>?> fetchRequest(String id) async {
    try {
      final raw = await _api.getCustomRequest(id);
      if (raw is Map) return Map<String, dynamic>.from(raw);
    } catch (e) {
      Get.snackbar('Lỗi', describeApiError(e));
    }
    return null;
  }

  Future<bool> createRequest(Map<String, dynamic> body) async {
    isLoading.value = true;
    try {
      await _api.createCustomRequest(body);
      Get.snackbar('Thành công', 'Đã gửi yêu cầu tới thợ');
      await loadSentRequests();
      return true;
    } catch (e) {
      Get.snackbar('Lỗi', describeApiError(e));
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  Future<bool> acceptRequest(String id, Map<String, dynamic> body) async {
    isLoading.value = true;
    try {
      await _api.acceptCustomRequest(id, body);
      Get.snackbar('Thành công', 'Đã chấp nhận và gửi báo giá cho khách');
      await loadReceivedRequests();
      return true;
    } catch (e) {
      Get.snackbar('Lỗi', describeApiError(e));
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  Future<bool> rejectRequest(String id, {String? reason}) async {
    try {
      await _api.rejectCustomRequest(id, reason: reason);
      Get.snackbar('Đã từ chối', 'Yêu cầu đã được từ chối');
      await loadReceivedRequests();
      return true;
    } catch (e) {
      Get.snackbar('Lỗi', describeApiError(e));
      return false;
    }
  }

  Future<bool> deleteRequest(String id) async {
    try {
      await _api.deleteCustomRequest(id);
      sentRequests.removeWhere((r) => r['id']?.toString() == id);
      Get.snackbar('Đã xóa', 'Yêu cầu đã xóa');
      return true;
    } catch (e) {
      Get.snackbar('Lỗi', describeApiError(e));
      return false;
    }
  }
}
