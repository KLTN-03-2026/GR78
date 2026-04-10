import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lucide_icons/lucide_icons.dart';
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

  final List<Widget> pages = [
    const HomeTab(),
    const SearchTab(),
    const MessageTab(),
    const NotificationTab(),
    const CustomerProfileTab(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: currentIndex, children: pages),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: currentIndex,
        selectedItemColor: Colors.teal,
        unselectedItemColor: Colors.grey,
        type: BottomNavigationBarType.fixed,
        onTap: (index) {
          final controllerPost = Get.find<PostController>();
          switch (index) {
            case 0:
              controllerPost.loadFeed();
              setState(() {
                currentIndex = index;
              });
              break;
            case 1:
              setState(() {
                currentIndex = index;
              });
              break;
            case 2:
              setState(() {
                currentIndex = index;
              });
              break;
            case 3:
              setState(() {
                currentIndex = index;
              });
              if (Get.isRegistered<NotificationController>()) {
                Get.find<NotificationController>().refreshAll();
              }
              break;
            case 4:
              setState(() {
                currentIndex = index;
              });
              controllerPost.loadMyPosts();
              break;
            default:
          }
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(LucideIcons.home),
            label: "Trang chủ",
          ),
          BottomNavigationBarItem(
            icon: Icon(LucideIcons.search),
            label: "Tìm kiếm",
          ),
          BottomNavigationBarItem(
            icon: Icon(LucideIcons.messageSquare),
            label: "Tin nhắn",
          ),
          BottomNavigationBarItem(
            icon: Icon(LucideIcons.bell),
            label: "Thông báo",
          ),
          BottomNavigationBarItem(
            icon: Icon(LucideIcons.user),
            label: "Cá nhân",
          ),
        ],
      ),
    );
  }
}
