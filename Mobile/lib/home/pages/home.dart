import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile_app_doan/core/user_role_context.dart';
import 'package:mobile_app_doan/features/auth/controllers/auth_controller.dart';
import 'package:mobile_app_doan/home/controllers/chat_controller.dart';
import 'package:mobile_app_doan/home/controllers/mobile_shell_controller.dart';
import 'package:mobile_app_doan/home/controllers/user_controller.dart';
import 'package:mobile_app_doan/home/controllers/notification_controller.dart';
import 'package:mobile_app_doan/home/controllers/post_controller.dart';
import 'package:mobile_app_doan/home/pages/tabs/home_tab.dart';
import 'package:mobile_app_doan/home/pages/tabs/messge_tab.dart';
import 'package:mobile_app_doan/home/pages/tabs/notification_tab.dart';
import 'package:mobile_app_doan/home/pages/tabs/profile_tab.dart';
import 'package:mobile_app_doan/home/pages/tabs/search_tab.dart';
import 'package:mobile_app_doan/home/widgets/notification_badge_icon.dart';

class MobileHomeScreen extends StatefulWidget {
  const MobileHomeScreen({super.key});

  @override
  State<MobileHomeScreen> createState() => _MobileHomeScreenState();
}

class _MobileHomeScreenState extends State<MobileHomeScreen> {
  int currentIndex = 0;

  List<Widget> _tabPages() => [
        HomeTab(
          key: const PageStorageKey<String>('shell_home_tab'),
          shellTabVisible: currentIndex == 0,
        ),
        const SearchTab(key: PageStorageKey<String>('shell_search_tab')),
        const MessageTab(key: PageStorageKey<String>('shell_message_tab')),
        const NotificationTab(key: PageStorageKey<String>('shell_notification_tab')),
        const CustomerProfileTab(key: PageStorageKey<String>('shell_profile_tab')),
      ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      if (Get.isRegistered<MobileShellController>()) {
        Get.find<MobileShellController>().bind((int i) {
          if (!mounted) return;
          _selectTab(i);
        });
      }
      if (Get.isRegistered<NotificationController>()) {
        Get.find<NotificationController>().loadUnreadCount();
      }
    });
  }

  @override
  void dispose() {
    if (Get.isRegistered<MobileShellController>()) {
      Get.find<MobileShellController>().unbind();
    }
    super.dispose();
  }

  void _selectTab(int index) {
    final controllerPost = Get.find<PostController>();
    switch (index) {
      case 0:
        controllerPost.loadFeed();
        setState(() => currentIndex = index);
        break;
      case 1:
        setState(() => currentIndex = index);
        break;
      case 2:
        setState(() => currentIndex = index);
        if (Get.isRegistered<ChatController>()) {
          Get.find<ChatController>().loadConversations();
        }
        break;
      case 3:
        setState(() => currentIndex = index);
        if (Get.isRegistered<NotificationController>()) {
          Get.find<NotificationController>().refreshAll();
        }
        break;
      case 4:
        setState(() => currentIndex = index);
        controllerPost.loadMyPosts();
        break;
      default:
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: currentIndex, children: _tabPages()),
      bottomNavigationBar: Obx(() {
        Get.find<AuthController>().userRole.value;
        if (Get.isRegistered<ProfileController>()) {
          Get.find<ProfileController>().profile.value;
        }
        final homeLabel =
            currentUserIsProvider() ? 'Việc mở' : 'Trang chủ';
        return NavigationBar(
          selectedIndex: currentIndex,
          onDestinationSelected: _selectTab,
          labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
          destinations: [
            NavigationDestination(
              icon: const Icon(LucideIcons.home),
              label: homeLabel,
            ),
            const NavigationDestination(
              icon: Icon(LucideIcons.search),
              label: 'Tìm kiếm',
            ),
            const NavigationDestination(
              icon: Icon(LucideIcons.messageSquare),
              label: 'Tin nhắn',
            ),
            NavigationDestination(
              icon: NotificationBellWithBadge(icon: LucideIcons.bell),
              label: 'Thông báo',
            ),
            NavigationDestination(
              icon: const Icon(LucideIcons.user),
              label: currentUserIsProvider() ? 'Hồ sơ thợ' : 'Cá nhân',
            ),
          ],
        );
      }),
    );
  }
}
