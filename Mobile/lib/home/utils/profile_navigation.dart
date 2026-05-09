import 'package:get/get.dart';

/// Mở hồ sơ công khai (GET /profile/user/:id).
void navigateToPublicProfile(String? userId) {
  final id = userId?.trim() ?? '';
  if (id.isEmpty) return;
  Get.toNamed<void>('/user/$id');
}
