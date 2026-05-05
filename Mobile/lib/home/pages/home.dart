import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile_app_doan/home/controllers/chat_controller.dart';
import 'package:mobile_app_doan/home/controllers/notification_controller.dart';
import 'package:mobile_app_doan/home/controllers/post_controller.dart';
import 'package:mobile_app_doan/home/pages/tabs/home_tab.dart';
import 'package:mobile_app_doan/home/pages/tabs/messge_tab.dart';
import 'package:mobile_app_doan/home/pages/tabs/notification_tab.dart';
import 'package:mobile_app_doan/home/pages/tabs/profile_tab.dart';
import 'package:mobile_app_doan/home/pages/tabs/search_tab.dart';

class MobileHomeScreen extends StatefulWidget {
  const MobileHomeScreen({super.key});

  @override
  State<MobileHomeScreen> createState() => _MobileHomeScreenState();
}

class _MobileHomeScreenState extends State<MobileHomeScreen> {
  int currentIndex = 0;
  late final List<Widget> _pages;

  @override
  void initState() {
    super.initState();
    _pages = [
      HomeTab(onOpenTab: _selectTab),
      const SearchTab(),
      const MessageTab(),
      const NotificationTab(),
      const CustomerProfileTab(),
    ];
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
      body: IndexedStack(index: currentIndex, children: _pages),
      bottomNavigationBar: NavigationBar(
        selectedIndex: currentIndex,
        onDestinationSelected: _selectTab,
        destinations: const [
          NavigationDestination(
            icon: Icon(LucideIcons.home),
            label: 'Trang chủ',
          ),
          NavigationDestination(
            icon: Icon(LucideIcons.search),
            label: 'Tìm kiếm',
          ),
          NavigationDestination(
            icon: Icon(LucideIcons.messageSquare),
            label: 'Tin nhắn',
          ),
          NavigationDestination(
            icon: Icon(LucideIcons.bell),
            label: 'Thông báo',
          ),
          NavigationDestination(
            icon: Icon(LucideIcons.user),
            label: 'Cá nhân',
          ),
        ],
      ),
    );
  }
}
