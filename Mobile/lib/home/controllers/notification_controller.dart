import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import 'package:mobile_app_doan/core/api_socket_root.dart';
import 'package:mobile_app_doan/core/token_helper.dart';
import 'package:mobile_app_doan/home/repo/notification_repository.dart';
import 'package:mobile_app_doan/main.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

class NotificationController extends GetxController {
  NotificationController(this.repository);

  final NotificationRepository repository;

  final isLoading = false.obs;
  final errorMessage = ''.obs;
  final items = <Map<String, dynamic>>[].obs;
  final unreadCount = 0.obs;

  IO.Socket? _socket;

  String _rowId(Map<String, dynamic> e) =>
      (e['id'] ?? e['_id'] ?? '').toString();

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
    } catch (_) {}
  }

  /// Khớp backend `NotificationsGateway` namespace `/notifications` + `auth.token`.
  Future<void> connectNotificationSocket() async {
    await disconnectNotificationSocket();
    final token = await TokenHelper.getAccessToken();
    if (token == null || token.isEmpty) return;

    final apiBase = globalApi?.dio.options.baseUrl;
    if (apiBase == null || apiBase.isEmpty) return;
    final root = apiSocketRootFromBase(apiBase);
    final uri = '$root/notifications';

    try {
      _socket = IO.io(
        uri,
        IO.OptionBuilder()
            .setTransports(['websocket'])
            .setAuth(<String, dynamic>{'token': token})
            .setExtraHeaders(<String, String>{
              'ngrok-skip-browser-warning': 'true',
            })
            .enableReconnection()
            .setReconnectionAttempts(8)
            .setReconnectionDelay(2000)
            .build(),
      );

      _socket!.on('connect', (_) {
        if (kDebugMode) {
          debugPrint('[notifications socket] connected ${_socket?.id}');
        }
      });

      _socket!.on('disconnect', (_) {
        if (kDebugMode) {
          debugPrint('[notifications socket] disconnected');
        }
      });

      _socket!.on('connect_error', (err) {
        if (kDebugMode) {
          debugPrint('[notifications socket] connect_error: $err');
        }
      });

      _socket!.on('notification:new', (dynamic data) {
        if (data is Map) {
          final m = Map<String, dynamic>.from(data);
          items.insert(0, m);
          unreadCount.value = unreadCount.value + 1;
        } else {
          unawaited(refreshAll());
        }
      });

      _socket!.on('notification:read', (dynamic data) {
        if (data is Map && data['notificationId'] != null) {
          final id = data['notificationId'].toString();
          final idx = items.indexWhere((e) => _rowId(e) == id);
          if (idx >= 0) {
            final m = Map<String, dynamic>.from(items[idx]);
            m['isRead'] = true;
            items[idx] = m;
          }
        }
        unawaited(loadUnreadCount());
      });

      _socket!.on('notification:all_read', (_) {
        unreadCount.value = 0;
        for (var i = 0; i < items.length; i++) {
          final m = Map<String, dynamic>.from(items[i]);
          m['isRead'] = true;
          items[i] = m;
        }
      });

      _socket!.connect();
    } catch (e) {
      if (kDebugMode) {
        debugPrint('[notifications socket] init error: $e');
      }
    }
  }

  Future<void> disconnectNotificationSocket() async {
    if (_socket != null) {
      _socket!.disconnect();
      _socket!.dispose();
      _socket = null;
    }
  }

  @override
  void onClose() {
    disconnectNotificationSocket();
    super.onClose();
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
      items.removeWhere((e) => _rowId(e) == id);
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
