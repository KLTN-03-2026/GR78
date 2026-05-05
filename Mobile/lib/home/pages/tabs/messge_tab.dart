import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile_app_doan/core/widgets/app_empty_state.dart';
import 'package:mobile_app_doan/core/widgets/app_error_state.dart';
import 'package:mobile_app_doan/core/widgets/app_list_skeleton.dart';
import 'package:mobile_app_doan/core/widgets/app_page_header.dart';
import 'package:mobile_app_doan/home/controllers/chat_controller.dart';

class MessageTab extends StatefulWidget {
  const MessageTab({super.key});

  @override
  State<MessageTab> createState() => _MessageTabState();
}

class _MessageTabState extends State<MessageTab> {
  final _input = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      if (Get.isRegistered<ChatController>()) {
        final cc = Get.find<ChatController>();
        await cc.connectChatSocket();
        await cc.loadConversations();
      }
    });
  }

  @override
  void dispose() {
    _input.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cc = Get.find<ChatController>();

    return Obx(() {
      if (cc.view.value == 'chat') {
        return _ChatDetailView(
          controller: cc,
          messageController: _input,
        );
      }
      return _ConversationListView(controller: cc);
    });
  }
}

class _ConversationListView extends StatelessWidget {
  const _ConversationListView({required this.controller});

  final ChatController controller;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surfaceContainerLowest,
      body: Column(
        children: [
          AppPageHeader(
            title: 'Tin nhắn',
            trailing: [
              IconButton(
                onPressed: () => controller.loadConversations(),
                icon: const Icon(Icons.refresh, color: Colors.white),
              ),
            ],
          ),
          Expanded(
            child: Obx(() {
              if (controller.isLoading.value && controller.conversations.isEmpty) {
                return const AppListSkeleton(itemCount: 4);
              }
              if (controller.errorMessage.value.isNotEmpty &&
                  controller.conversations.isEmpty) {
                return AppErrorState(
                  message: controller.errorMessage.value,
                  onRetry: controller.loadConversations,
                );
              }
              if (controller.conversations.isEmpty) {
                return const AppEmptyState(
                  title: 'Chưa có cuộc trò chuyện',
                  subtitle: 'Bắt đầu trò chuyện với thợ hoặc khách hàng.',
                  icon: LucideIcons.messageSquare,
                );
              }
              return RefreshIndicator(
                onRefresh: () => controller.loadConversations(),
                child: ListView.builder(
                  itemCount: controller.conversations.length,
                  itemBuilder: (context, index) {
                    final c = controller.conversations[index];
                    final id = c['id']?.toString() ?? '';
                    final title = controller.titleFor(c);
                    final preview = controller.previewFor(c);
                    final unread = controller.unreadFor(c);
                    return ListTile(
                      onTap: id.isEmpty ? null : () => controller.openConversation(id),
                      leading: CircleAvatar(
                        backgroundColor:
                            Theme.of(context).colorScheme.primaryContainer,
                        child: Text(
                          title.isNotEmpty ? title[0].toUpperCase() : '?',
                          style: TextStyle(
                            color: Theme.of(context).colorScheme.onPrimaryContainer,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      title: Text(
                        title,
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
                      subtitle: Text(
                        preview,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      trailing: unread > 0
                          ? Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: Theme.of(context).colorScheme.primary,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                '$unread',
                                style: TextStyle(
                                  color: Theme.of(context).colorScheme.onPrimary,
                                  fontSize: 12,
                                ),
                              ),
                            )
                          : null,
                    );
                  },
                ),
              );
            }),
          ),
        ],
      ),
    );
  }
}

class _ChatDetailView extends StatelessWidget {
  const _ChatDetailView({
    required this.controller,
    required this.messageController,
  });

  final ChatController controller;
  final TextEditingController messageController;

  @override
  Widget build(BuildContext context) {
    final title = controller.selectedConversation == null
        ? 'Chat'
        : controller.titleFor(controller.selectedConversation!);

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surfaceContainerLowest,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => controller.backToList(),
        ),
        title: Text(title),
        actions: [
          PopupMenuButton<String>(
            onSelected: (v) {
              if (v == 'close') controller.closeCurrentConversation();
              if (v == 'delete') controller.deleteCurrentConversation();
            },
            itemBuilder: (_) => const [
              PopupMenuItem(value: 'close', child: Text('Đóng hội thoại')),
              PopupMenuItem(value: 'delete', child: Text('Xóa hội thoại')),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: Obx(() {
              if (controller.isLoading.value && controller.messages.isEmpty) {
                return const Center(child: CircularProgressIndicator());
              }
              final list = controller.messages.toList();
              return ListView.builder(
                padding: const EdgeInsets.all(12),
                itemCount: list.length,
                itemBuilder: (context, index) {
                  final m = list[index];
                  final isMe = controller.isMine(m);
                  final body = controller.messageBody(m);
                  return Align(
                    alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                    child: Container(
                      margin: const EdgeInsets.symmetric(vertical: 4),
                      padding: const EdgeInsets.all(12),
                      constraints: BoxConstraints(
                        maxWidth: MediaQuery.sizeOf(context).width * 0.78,
                      ),
                      decoration: BoxDecoration(
                        color: isMe
                            ? Theme.of(context).colorScheme.primary
                            : Theme.of(context).colorScheme.surface,
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Text(
                        body,
                        style: TextStyle(
                          color: isMe
                              ? Theme.of(context).colorScheme.onPrimary
                              : Theme.of(context).colorScheme.onSurface,
                        ),
                      ),
                    ),
                  );
                },
              );
            }),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: messageController,
                      decoration: InputDecoration(
                        hintText: 'Nhập tin nhắn...',
                        filled: true,
                        fillColor: Theme.of(context)
                            .colorScheme
                            .surfaceContainerHighest
                            .withValues(alpha: 0.6),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: BorderSide.none,
                        ),
                      ),
                      minLines: 1,
                      maxLines: 4,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Obx(() {
                    final busy = controller.isSending.value;
                    return IconButton.filled(
                      onPressed: busy
                          ? null
                          : () async {
                              final t = messageController.text;
                              messageController.clear();
                              await controller.sendText(t);
                            },
                      icon: const Icon(LucideIcons.send),
                    );
                  }),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
