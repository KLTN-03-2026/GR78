import 'dart:async';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile_app_doan/home/controllers/notification_controller.dart';
import 'package:mobile_app_doan/home/utils/parse_api_list.dart';

class NotificationTab extends StatefulWidget {
  const NotificationTab({super.key});

  @override
  State<NotificationTab> createState() => _NotificationTabState();
}

class _NotificationTabState extends State<NotificationTab>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    scheduleMicrotask(() {
      if (Get.isRegistered<NotificationController>()) {
        Get.find<NotificationController>().refreshAll();
      }
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  String _id(Map<String, dynamic> raw) =>
      (raw['id'] ?? raw['_id'] ?? '').toString();

  String _title(Map<String, dynamic> raw) {
    return stringField(raw, ['title', 'subject', 'type', 'name']);
  }

  String _body(Map<String, dynamic> raw) {
    return stringField(raw, ['body', 'message', 'content', 'description']);
  }

  bool _isRead(Map<String, dynamic> raw) {
    final v = raw['read'] ?? raw['isRead'] ?? raw['readAt'];
    if (v == null) return false;
    if (v is bool) return v;
    return true;
  }

  @override
  Widget build(BuildContext context) {
    final notif = Get.find<NotificationController>();

    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.fromLTRB(16, 48, 16, 16),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.teal, Colors.tealAccent],
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Obx(() {
                  final n = notif.unreadCount.value;
                  return Text(
                    n > 0 ? 'Thông báo ($n chưa đọc)' : 'Thông báo',
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  );
                }),
                PopupMenuButton<String>(
                  icon: const Icon(LucideIcons.moreVertical, color: Colors.white),
                  onSelected: (v) {
                    if (v == 'all') notif.markAllAsRead();
                    if (v == 'clear') notif.clearRead();
                    if (v == 'refresh') notif.refreshAll();
                  },
                  itemBuilder: (ctx) => const [
                    PopupMenuItem(value: 'refresh', child: Text('Làm mới')),
                    PopupMenuItem(
                      value: 'all',
                      child: Text('Đánh dấu tất cả đã đọc'),
                    ),
                    PopupMenuItem(
                      value: 'clear',
                      child: Text('Xóa thông báo đã đọc'),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Container(
            color: Colors.teal,
            child: TabBar(
              controller: _tabController,
              labelColor: Colors.white,
              unselectedLabelColor: Colors.white70,
              indicatorColor: Colors.white,
              indicatorWeight: 3,
              tabs: const [
                Tab(text: 'Tất cả'),
                Tab(text: 'Chưa đọc'),
              ],
            ),
          ),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildList(notif, unreadOnly: false),
                _buildList(notif, unreadOnly: true),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildList(NotificationController c, {required bool unreadOnly}) {
    return Obx(() {
      final source = unreadOnly
          ? c.items.where((e) => !_isRead(e)).toList()
          : c.items.toList();

      if (c.isLoading.value && c.items.isEmpty) {
        return const Center(child: CircularProgressIndicator());
      }
      if (c.errorMessage.value.isNotEmpty && c.items.isEmpty) {
        return Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(c.errorMessage.value, textAlign: TextAlign.center),
                const SizedBox(height: 16),
                FilledButton(
                  onPressed: () => c.refreshAll(),
                  child: const Text('Thử lại'),
                ),
              ],
            ),
          ),
        );
      }
      if (source.isEmpty) {
        return Center(
          child: Text(
            unreadOnly ? 'Không có thông báo chưa đọc' : 'Không có thông báo',
          ),
        );
      }

      return RefreshIndicator(
        onRefresh: () => c.refreshAll(),
        child: ListView.builder(
          padding: const EdgeInsets.all(12),
          itemCount: source.length,
          itemBuilder: (context, index) {
            final item = source[index];
            final id = _id(item);
            final read = _isRead(item);
            final title = _title(item).isEmpty ? 'Thông báo' : _title(item);
            final body = _body(item);

            return Dismissible(
              key: ValueKey(id.isEmpty ? index.toString() : id),
              direction: DismissDirection.endToStart,
              background: Container(
                alignment: Alignment.centerRight,
                padding: const EdgeInsets.only(right: 20),
                color: Colors.red,
                child: const Icon(Icons.delete, color: Colors.white),
              ),
              onDismissed: (_) {
                if (id.isNotEmpty) c.remove(id);
              },
              child: Card(
                margin: const EdgeInsets.only(bottom: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: ListTile(
                  tileColor: read ? null : Colors.teal.withValues(alpha: 0.06),
                  leading: CircleAvatar(
                    backgroundColor:
                        read ? Colors.grey[200] : Colors.teal.withValues(alpha: 0.2),
                    child: Icon(
                      read ? LucideIcons.bell : LucideIcons.bellRing,
                      color: read ? Colors.grey : Colors.teal,
                    ),
                  ),
                  title: Text(
                    title,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  subtitle:
                      body.isEmpty ? null : Text(body, maxLines: 3, overflow: TextOverflow.ellipsis),
                  onTap: () {
                    if (id.isNotEmpty && !read) c.markRead(id);
                  },
                ),
              ),
            );
          },
        ),
      );
    });
  }
}
