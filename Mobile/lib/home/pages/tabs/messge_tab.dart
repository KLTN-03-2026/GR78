import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';

class MessageTab extends StatefulWidget {
  const MessageTab({super.key});

  @override
  State<MessageTab> createState() => _MessageTabState();
}

class _MessageTabState extends State<MessageTab> {
  String screen = 'list'; // list, chat, info
  int? selectedChat;
  bool isRecording = false;
  final TextEditingController _messageController = TextEditingController();

  final List<Map<String, dynamic>> conversations = [
    {
      'id': 1,
      'name': 'Thợ Điện Minh',
      'avatar': '👨‍🔧',
      'lastMessage': 'Chào anh, em có thể qua chiều nay ạ',
      'time': '10:30',
      'unread': 2,
      'online': true,
      'isProvider': true,
      'rating': 4.8,
      'service': 'Sửa chữa điện',
    },
    {
      'id': 2,
      'name': 'Thợ Sơn Đức',
      'avatar': '👷',
      'lastMessage': 'Em đã gửi báo giá cho anh rồi ạ',
      'time': '09:15',
      'unread': 0,
      'online': true,
      'isProvider': true,
      'rating': 5.0,
      'service': 'Sơn nhà',
    },
    {
      'id': 3,
      'name': 'Nguyễn Văn A',
      'avatar': '👨',
      'lastMessage': 'Cảm ơn bạn nhiều nhé!',
      'time': 'Hôm qua',
      'unread': 0,
      'online': false,
      'isProvider': false,
    },
  ];

  final List<Map<String, dynamic>> messages = [
    {
      'id': 1,
      'sender': 'me',
      'content':
          'Chào bạn, mình cần sửa chữa điện tại nhà gấp. Bạn có rảnh không?',
      'time': '14:20',
      'status': 'read',
    },
    {
      'id': 2,
      'sender': 'them',
      'content':
          'Chào anh! Em nhận được yêu cầu của anh rồi ạ. Anh cho em xin địa chỉ cụ thể được không ạ?',
      'time': '14:22',
      'status': 'delivered',
    },
    {
      'id': 3,
      'sender': 'me',
      'content':
          'Nhà mình ở 123 Lê Duẩn, Hải Châu, Đà Nẵng. Khu vực gần siêu thị Big C',
      'time': '14:23',
      'status': 'read',
    },
  ];

  Map<String, dynamic>? get currentChat {
    if (selectedChat == null) return null;
    for (final c in conversations) {
      if (c['id'] == selectedChat) {
        return Map<String, dynamic>.from(c);
      }
    }
    return null;
  }

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (screen == 'list') return _buildChatList();
    if (screen == 'chat') return _buildChatDetail();
    if (screen == 'info') return _buildChatInfo();
    return const SizedBox();
  }

  // ---------------- LIST SCREEN ----------------
  Widget _buildChatList() {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.fromLTRB(16, 48, 16, 16),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.teal, Colors.tealAccent],
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
              ),
            ),
            child: Column(
              children: [
                Row(
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
                      onPressed: () {},
                      icon: const Icon(
                        LucideIcons.moreVertical,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                TextField(
                  decoration: InputDecoration(
                    hintText: "Tìm kiếm tin nhắn...",
                    filled: true,
                    fillColor: Colors.white,
                    prefixIcon: const Icon(Icons.search, color: Colors.grey),
                    contentPadding: const EdgeInsets.symmetric(vertical: 0),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(30),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // List
          Expanded(
            child: ListView.builder(
              itemCount: conversations.length,
              itemBuilder: (context, index) {
                final Map<String, dynamic> conv = conversations[index];
                return ListTile(
                  onTap: () {
                    setState(() {
                      selectedChat = conv['id'] as int?;
                      screen = 'chat';
                    });
                  },
                  leading: Stack(
                    children: [
                      CircleAvatar(
                        radius: 26,
                        backgroundColor: Colors.teal,
                        child: Text(
                          conv['avatar']?.toString() ?? '',
                          style: const TextStyle(fontSize: 22),
                        ),
                      ),
                      if (conv['online'] == true)
                        Positioned(
                          right: 0,
                          bottom: 0,
                          child: Container(
                            width: 12,
                            height: 12,
                            decoration: BoxDecoration(
                              color: Colors.green,
                              border: Border.all(color: Colors.white, width: 2),
                              shape: BoxShape.circle,
                            ),
                          ),
                        ),
                    ],
                  ),
                  title: Text(
                    conv['name']?.toString() ?? '',
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                  subtitle: Text(
                    conv['lastMessage']?.toString() ?? '',
                    overflow: TextOverflow.ellipsis,
                  ),
                  trailing: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        conv['time']?.toString() ?? '',
                        style: const TextStyle(
                          fontSize: 12,
                          color: Colors.grey,
                        ),
                      ),
                      if ((conv['unread'] is int) && conv['unread'] > 0)
                        Container(
                          margin: const EdgeInsets.only(top: 4),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 6,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.teal,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            '${conv['unread']}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 10,
                            ),
                          ),
                        ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- CHAT SCREEN ----------------
  Widget _buildChatDetail() {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => setState(() => screen = 'list'),
        ),
        titleSpacing: 0,
        title: InkWell(
          onTap: () => setState(() => screen = 'info'),
          child: Row(
            children: [
              Stack(
                children: [
                  CircleAvatar(
                    backgroundColor: Colors.teal,
                    child: Text(currentChat?['avatar']?.toString() ?? ''),
                  ),
                  if (currentChat?['online'] == true)
                    Positioned(
                      right: 0,
                      bottom: 0,
                      child: Container(
                        width: 10,
                        height: 10,
                        decoration: BoxDecoration(
                          color: Colors.green,
                          border: Border.all(color: Colors.white, width: 2),
                          shape: BoxShape.circle,
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  currentChat?['name']?.toString() ?? '',
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    color: Colors.black,
                  ),
                ),
              ),
            ],
          ),
        ),
        actions: [
          IconButton(
            onPressed: () {},
            icon: const Icon(LucideIcons.phone, color: Colors.teal),
          ),
          IconButton(
            onPressed: () {},
            icon: const Icon(LucideIcons.video, color: Colors.teal),
          ),
        ],
      ),

      // Messages
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: messages.length,
              itemBuilder: (context, index) {
                final msg = messages[index];
                final isMe = msg['sender'] == 'me';
                return Align(
                  alignment: isMe
                      ? Alignment.centerRight
                      : Alignment.centerLeft,
                  child: Column(
                    crossAxisAlignment: isMe
                        ? CrossAxisAlignment.end
                        : CrossAxisAlignment.start,
                    children: [
                      Container(
                        margin: const EdgeInsets.symmetric(vertical: 4),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: isMe ? Colors.teal : Colors.white,
                          borderRadius: BorderRadius.only(
                            topLeft: const Radius.circular(16),
                            topRight: const Radius.circular(16),
                            bottomLeft: Radius.circular(isMe ? 16 : 0),
                            bottomRight: Radius.circular(isMe ? 0 : 16),
                          ),
                        ),
                        child: Text(
                          msg['content']?.toString() ?? '',
                          style: TextStyle(
                            color: isMe ? Colors.white : Colors.black87,
                          ),
                        ),
                      ),
                      Text(
                        msg['time']?.toString() ?? '',
                        style: const TextStyle(
                          fontSize: 11,
                          color: Colors.grey,
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),

          // Input
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      decoration: BoxDecoration(
                        color: Colors.grey[200],
                        borderRadius: BorderRadius.circular(24),
                      ),
                      child: Row(
                        children: [
                          IconButton(
                            onPressed: () {},
                            icon: const Icon(
                              LucideIcons.smile,
                              color: Colors.grey,
                            ),
                          ),
                          Expanded(
                            child: TextField(
                              controller: _messageController,
                              decoration: const InputDecoration(
                                hintText: "Aa",
                                border: InputBorder.none,
                              ),
                            ),
                          ),
                          IconButton(
                            onPressed: () {},
                            icon: const Icon(
                              LucideIcons.paperclip,
                              color: Colors.grey,
                            ),
                          ),
                          IconButton(
                            onPressed: () {},
                            icon: const Icon(
                              LucideIcons.camera,
                              color: Colors.grey,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  GestureDetector(
                    onTapDown: (_) => setState(() => isRecording = true),
                    onTapUp: (_) => setState(() => isRecording = false),
                    onTapCancel: () => setState(() => isRecording = false),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: isRecording ? Colors.red : Colors.teal,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        _messageController.text.isNotEmpty
                            ? LucideIcons.send
                            : LucideIcons.mic,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- INFO SCREEN ----------------
  Widget _buildChatInfo() {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.fromLTRB(16, 48, 16, 24),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.teal, Colors.tealAccent],
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
              ),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    IconButton(
                      onPressed: () => setState(() => screen = 'chat'),
                      icon: const Icon(Icons.arrow_back, color: Colors.white),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                CircleAvatar(
                  radius: 40,
                  backgroundColor: Colors.white,
                  child: Text(
                    currentChat?['avatar']?.toString() ?? '',
                    style: const TextStyle(fontSize: 36),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  currentChat?['name']?.toString() ?? '',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                if (currentChat?['isProvider'] == true)
                  const Text(
                    "Thợ chuyên nghiệp",
                    style: TextStyle(color: Colors.white70, fontSize: 12),
                  ),
              ],
            ),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                ListTile(
                  leading: const Icon(LucideIcons.phone, color: Colors.teal),
                  title: const Text("Gọi điện"),
                  onTap: () {},
                ),
                ListTile(
                  leading: const Icon(LucideIcons.video, color: Colors.blue),
                  title: const Text("Video call"),
                ),
                ListTile(
                  leading: const Icon(LucideIcons.star, color: Colors.orange),
                  title: const Text("Đánh giá"),
                ),
                const Divider(),
                ListTile(
                  leading: const Icon(LucideIcons.mapPin),
                  title: const Text("Khu vực hoạt động"),
                  subtitle: const Text("Hải Châu, Thanh Khê, Sơn Trà, Đà Nẵng"),
                ),
                ListTile(
                  leading: const Icon(LucideIcons.search),
                  title: const Text("Tìm kiếm tin nhắn"),
                ),
                ListTile(
                  leading: const Icon(Icons.person_outline),
                  title: const Text("Xem hồ sơ thợ"),
                ),
                ListTile(
                  leading: const Icon(Icons.notifications_off_outlined),
                  title: const Text("Tắt thông báo"),
                ),
                ListTile(
                  leading: const Icon(Icons.block, color: Colors.red),
                  title: const Text("Chặn người dùng"),
                  textColor: Colors.red,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
