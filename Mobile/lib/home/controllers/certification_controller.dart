import 'package:get/get.dart';
import 'package:mobile_app_doan/core/api_error_message.dart';
import 'package:mobile_app_doan/home/repo/backend_rest_repository.dart';
import 'package:mobile_app_doan/home/utils/parse_api_list.dart';

class CertificationController extends GetxController {
  CertificationController(this._api);

  final BackendRestRepository _api;

  final isLoading = false.obs;
  final certifications = <Map<String, dynamic>>[].obs;

  Future<void> loadMyCertifications() async {
    isLoading.value = true;
    try {
      final raw = await _api.getMyCertifications();
      if (raw is Map) {
        certifications.assignAll(parseObjectList(raw['data']));
      }
    } catch (e) {
      Get.snackbar('Lỗi', describeApiError(e));
    } finally {
      isLoading.value = false;
    }
  }

  Future<List<Map<String, dynamic>>> loadProviderCertifications(String providerId) async {
    try {
      final raw = await _api.getProviderCertifications(providerId);
      if (raw is Map) return parseObjectList(raw['data']);
    } catch (_) {}
    return [];
  }

  Future<bool> deleteCertification(String id) async {
    try {
      await _api.deleteCertification(id);
      certifications.removeWhere((c) => c['id']?.toString() == id);
      Get.snackbar('Đã xóa', 'Chứng chỉ đã được xóa');
      return true;
    } catch (e) {
      Get.snackbar('Lỗi', describeApiError(e));
      return false;
    }
  }

  Future<bool> uploadCertification({
    required List<int> fileBytes,
    required String fileName,
    required String title,
    String? issuingOrganization,
    String? issueDate,
    String? expiryDate,
  }) async {
    isLoading.value = true;
    try {
      await _api.uploadCertification(
        fileBytes,
        fileName,
        title,
        issuingOrganization: issuingOrganization,
        issueDate: issueDate,
        expiryDate: expiryDate,
      );
      Get.snackbar('Đã tải lên', 'Chứng chỉ đang chờ admin xét duyệt');
      await loadMyCertifications();
      return true;
    } catch (e) {
      Get.snackbar('Lỗi', describeApiError(e));
      return false;
    } finally {
      isLoading.value = false;
    }
  }
}
