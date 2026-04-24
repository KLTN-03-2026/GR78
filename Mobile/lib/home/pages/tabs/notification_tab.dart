import 'dart:async';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile_app_doan/core/widgets/app_empty_state.dart';
import 'package:mobile_app_doan/core/widgets/app_error_state.dart';
import 'package:mobile_app_doan/core/widgets/app_list_skeleton.dart';
import 'package:mobile_app_doan/core/widgets/app_page_header.dart';
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

    final scheme = Theme.of(context).colorScheme;
    return Scaffold(
      backgroundColor: scheme.surfaceContainerLowest,
      body: Column(
        children: [
          AppPageHeader(
            title: 'Thông báo',
            trailing: [
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
            bottom: Obx(() {
              final n = notif.unreadCount.value;
              if (n <= 0) return const SizedBox.shrink();
              return Text(
                '$n chưa đọc',
                style: const TextStyle(color: Colors.white70, fontSize: 14),
              );
            }),
          ),
          Material(
            color: scheme.primary,
            child: TabBar(
              controller: _tabController,
              labelColor: scheme.onPrimary,
              unselectedLabelColor: scheme.onPrimary.withValues(alpha: 0.75),
              indicatorColor: scheme.onPrimary,
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
      final scheme = Theme.of(context).colorScheme;
      final source = unreadOnly
          ? c.items.where((e) => !_isRead(e)).toList()
          : c.items.toList();

      if (c.isLoading.value && c.items.isEmpty) {
        return const AppListSkeleton(itemCount: 4);
      }
      if (c.errorMessage.value.isNotEmpty && c.items.isEmpty) {
        return AppErrorState(
          message: c.errorMessage.value,
          onRetry: c.refreshAll,
        );
      }
      if (source.isEmpty) {
        return AppEmptyState(
          title: unreadOnly ? 'Không có thông báo chưa đọc' : 'Không có thông báo',
          subtitle: 'Khi có hoạt động mới, thông báo sẽ xuất hiện tại đây.',
          icon: Icons.notifications_off_outlined,
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
                color: Theme.of(context).colorScheme.error,
                child: Icon(
                  Icons.delete,
                  color: Theme.of(context).colorScheme.onError,
                ),
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
                  tileColor: read ? null : scheme.primary.withValues(alpha: 0.06),
                  leading: CircleAvatar(
                    backgroundColor: read
                        ? scheme.surfaceContainerHighest
                        : scheme.primaryContainer,
                    child: Icon(
                      read ? LucideIcons.bell : LucideIcons.bellRing,
                      color: read ? scheme.onSurfaceVariant : scheme.primary,
                    ),
                  ),
                  title: Text(
                    title,
                    style: Theme.of(context).textTheme.titleSmall,
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
