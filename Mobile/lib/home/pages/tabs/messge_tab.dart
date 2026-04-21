import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lucide_icons/lucide_icons.dart';
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
      backgroundColor: Colors.white,
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.fromLTRB(16, 48, 16, 16),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.teal, Color(0xFF2DD4BF)],
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Tin nhắn',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                IconButton(
                  onPressed: () => controller.loadConversations(),
                  icon: const Icon(Icons.refresh, color: Colors.white),
                ),
              ],
            ),
          ),
          Expanded(
            child: Obx(() {
              if (controller.isLoading.value && controller.conversations.isEmpty) {
                return const Center(child: CircularProgressIndicator());
              }
              if (controller.errorMessage.value.isNotEmpty &&
                  controller.conversations.isEmpty) {
                return Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Text(
                      controller.errorMessage.value,
                      textAlign: TextAlign.center,
                    ),
                  ),
                );
              }
              if (controller.conversations.isEmpty) {
                return const Center(child: Text('Chưa có cuộc trò chuyện'));
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
                        backgroundColor: Colors.teal.shade100,
                        child: Text(
                          title.isNotEmpty ? title[0].toUpperCase() : '?',
                          style: const TextStyle(
                            color: Colors.teal,
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
                                color: Colors.teal,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                '$unread',
                                style: const TextStyle(
                                  color: Colors.white,
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
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => controller.backToList(),
        ),
        title: Text(title, style: const TextStyle(color: Colors.black87)),
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
                        color: isMe ? Colors.teal : Colors.white,
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Text(
                        body,
                        style: TextStyle(
                          color: isMe ? Colors.white : Colors.black87,
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
                        fillColor: Colors.grey[200],
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
