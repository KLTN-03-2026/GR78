import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile_app_doan/home/controllers/notification_controller.dart';

/// Icon chuông kèm badge số thông báo chưa đọc (chào giá, v.v.) — [NotificationController.unreadCount].
class NotificationBellWithBadge extends StatelessWidget {
  const NotificationBellWithBadge({
    super.key,
    required this.icon,
    this.size = 24,
  });

  final IconData icon;
  final double size;

  static String _countLabel(int n) {
    if (n <= 0) return '';
    if (n > 99) return '99+';
    return '$n';
  }

  @override
  Widget build(BuildContext context) {
    if (!Get.isRegistered<NotificationController>()) {
      return Icon(icon, size: size);
    }
    final scheme = Theme.of(context).colorScheme;
    return Obx(() {
      final n = Get.find<NotificationController>().unreadCount.value;
      if (n <= 0) {
        return Icon(icon, size: size);
      }
      return Badge(
        backgroundColor: scheme.error,
        label: Text(
          _countLabel(n),
          style: TextStyle(
            fontSize: n > 9 ? 9 : 10,
            fontWeight: FontWeight.w700,
            color: scheme.onError,
          ),
        ),
        child: Icon(icon, size: size),
      );
    });
  }
}
