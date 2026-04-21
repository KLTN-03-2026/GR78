import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile_app_doan/features/auth/controllers/auth_controller.dart';

class CustomDrawer extends StatelessWidget {
  const CustomDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Menu',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // User info
              Obx(() {
                final auth = Get.find<AuthController>();
                final name = auth.userName.value.isEmpty
                    ? 'Người dùng'
                    : auth.userName.value;
                return Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    children: [
                      const CircleAvatar(
                        radius: 24,
                        backgroundColor: Colors.teal,
                        child:
                            Icon(Icons.person, color: Colors.white, size: 28),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              name,
                              style:
                                  const TextStyle(fontWeight: FontWeight.bold),
                            ),
                            Text(
                              auth.userEmail.value.isEmpty
                                  ? 'Xem trang cá nhân'
                                  : auth.userEmail.value,
                              style: const TextStyle(color: Colors.grey),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              }),
              const SizedBox(height: 20),

              // Menu items
              _drawerItem(Icons.home_outlined, 'Trang chủ', () {
                Navigator.pop(context);
              }),
              _drawerItem(Icons.bookmark_border, 'Đã lưu', () {
                Navigator.pop(context);
              }),
              _drawerItem(Icons.history, 'Lịch sử yêu cầu', () {
                Navigator.pop(context);
              }),
              _drawerItem(Icons.favorite_border, 'Thợ yêu thích', () {
                Navigator.pop(context);
              }),
              _drawerItem(Icons.settings_outlined, 'Cài đặt', () {
                Navigator.pop(context);
              }),
              _drawerItem(Icons.api, 'API Console', () {
                Navigator.pop(context);
                Get.toNamed('/api');
              }),
              _drawerItem(Icons.request_quote, 'Báo giá đã gửi', () {
                Navigator.pop(context);
                Get.toNamed('/my-quotes');
              }),
              _drawerItem(Icons.devices, 'Đăng xuất mọi thiết bị', () async {
                Navigator.pop(context);
                final confirm = await Get.dialog<bool>(
                  AlertDialog(
                    title: const Text('Xác nhận'),
                    content: const Text(
                      'Đăng xuất tất cả thiết bị đang đăng nhập tài khoản này?',
                    ),
                    actions: [
                      TextButton(
                        onPressed: () => Get.back(result: false),
                        child: const Text('Hủy'),
                      ),
                      ElevatedButton(
                        onPressed: () => Get.back(result: true),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.orange,
                        ),
                        child: const Text('Đăng xuất hết'),
                      ),
                    ],
                  ),
                  barrierDismissible: false,
                );
                if (confirm == true) {
                  Get.dialog(
                    const PopScope(
                      canPop: false,
                      child: Center(child: CircularProgressIndicator()),
                    ),
                    barrierDismissible: false,
                  );
                  try {
                    await Get.find<AuthController>().logoutAllDevices();
                  } finally {
                    if (Get.isDialogOpen ?? false) Get.back();
                  }
                }
              }),
              _drawerItem(Icons.logout, 'Đăng xuất', () async {
                Navigator.pop(context);

                final confirm = await Get.dialog<bool>(
                  AlertDialog(
                    title: const Text('Xác nhận'),
                    content: const Text('Bạn có chắc muốn đăng xuất?'),
                    actions: [
                      TextButton(
                        onPressed: () => Get.back(result: false),
                        child: const Text('Hủy'),
                      ),
                      ElevatedButton(
                        onPressed: () => Get.back(result: true),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red,
                        ),
                        child: const Text('Đăng xuất'),
                      ),
                    ],
                  ),
                  barrierDismissible: false,
                );

                if (confirm == true) {
                  // Hiển thị loading
                  Get.dialog(
                    const PopScope(
                      canPop: false,
                      child: Center(child: CircularProgressIndicator()),
                    ),
                    barrierDismissible: false,
                  );

                  try {
                    final authController = Get.find<AuthController>();
                    await authController.logout();
                  } catch (e) {
                    print("❌ Drawer logout error: $e");
                  } finally {
                    if (Get.isDialogOpen ?? false) {
                      Get.back();
                    }
                  }
                }
              }),
            ],
          ),
        ),
      ),
    );
  }

  Widget _drawerItem(IconData icon, String text, VoidCallback onTap) {
    return ListTile(
      leading: Icon(icon, color: Colors.black54),
      title: Text(text, style: const TextStyle(fontWeight: FontWeight.w500)),
      onTap: onTap,
    );
  }
}
