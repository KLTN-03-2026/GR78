import 'package:get/get.dart';
import 'package:mobile_app_doan/home/repo/notification_repository.dart';

class NotificationController extends GetxController {
  final NotificationRepository repository;

  NotificationController(this.repository);

  final isLoading = false.obs;
  final errorMessage = ''.obs;
  final items = <Map<String, dynamic>>[].obs;
  final unreadCount = 0.obs;

  Future<void> refreshAll() async {
    await Future.wait([loadNotifications(), loadUnreadCount()]);
  }

  Future<void> loadNotifications() async {
    try {
      isLoading.value = true;
      errorMessage.value = '';
      final list = await repository.getNotifications(unreadOnly: false);
      items.assignAll(list);
    } catch (e) {
      errorMessage.value = e.toString();
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> loadUnreadCount() async {
    try {
      unreadCount.value = await repository.getUnreadCount();
    } catch (_) {
      // Không chặn UI nếu endpoint lỗi
    }
  }

  Future<void> markRead(String id) async {
    try {
      await repository.markAsRead(id);
      await refreshAll();
    } catch (e) {
      Get.snackbar('Lỗi', e.toString());
    }
  }

  Future<void> markAllAsRead() async {
    try {
      await repository.markAllAsRead();
      await refreshAll();
      Get.snackbar('Thành công', 'Đã đánh dấu đã đọc');
    } catch (e) {
      Get.snackbar('Lỗi', e.toString());
    }
  }

  Future<void> remove(String id) async {
    try {
      await repository.deleteNotification(id);
      items.removeWhere((e) => (e['id'] ?? e['_id'])?.toString() == id);
      await loadUnreadCount();
    } catch (e) {
      Get.snackbar('Lỗi', e.toString());
    }
  }

  Future<void> clearRead() async {
    try {
      await repository.deleteReadNotifications();
      await refreshAll();
      Get.snackbar('Thành công', 'Đã xóa thông báo đã đọc');
    } catch (e) {
      Get.snackbar('Lỗi', e.toString());
    }
  }
}
