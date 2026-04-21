import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile_app_doan/core/api_socket_root.dart';
import 'package:mobile_app_doan/core/token_helper.dart';
import 'package:mobile_app_doan/home/controllers/user_controller.dart';
import 'package:mobile_app_doan/home/repo/backend_rest_repository.dart';
import 'package:mobile_app_doan/main.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

List<Map<String, dynamic>> _asMapList(dynamic v) {
  if (v == null) return [];
  if (v is! List) return [];
  return v
      .whereType<Map>()
      .map((e) => Map<String, dynamic>.from(e))
      .toList();
}

Map<String, dynamic> _normalizeMessageMap(dynamic raw) {
  if (raw is! Map) return {};
  final m = Map<String, dynamic>.from(
    raw.map((k, v) => MapEntry(k.toString(), v)),
  );
  void alias(String camel, String snake) {
    if (m[camel] == null && m[snake] != null) m[camel] = m[snake];
  }

  alias('senderId', 'sender_id');
  alias('conversationId', 'conversation_id');
  alias('createdAt', 'created_at');
  alias('updatedAt', 'updated_at');
  if (m['type'] != null) m['type'] = m['type'].toString();
  return m;
}

class ChatController extends GetxController {
  ChatController(this._api);

  final BackendRestRepository _api;

  IO.Socket? _chatSocket;

  final isLoading = false.obs;
  final isSending = false.obs;
  final errorMessage = ''.obs;

  final conversations = <Map<String, dynamic>>[].obs;
  final messages = <Map<String, dynamic>>[].obs;

  final view = 'list'.obs;
  final selectedConversationId = RxnString();
  final hasMoreMessages = false.obs;

  String? get _myUserId => Get.find<ProfileController>().profile.value?.id;

  /// Khớp backend [ChatGateway] namespace `/chat` + `auth.token`.
  Future<void> connectChatSocket() async {
    await disconnectChatSocket();
    final token = await TokenHelper.getAccessToken();
    if (token == null || token.isEmpty) return;

    final apiBase = globalApi?.dio.options.baseUrl;
    if (apiBase == null || apiBase.isEmpty) return;
    final root = apiSocketRootFromBase(apiBase);
    final uri = '$root/chat';

    try {
      _chatSocket = IO.io(
        uri,
        IO.OptionBuilder()
            .setTransports(['websocket'])
            .setAuth(<String, dynamic>{'token': token})
            .setExtraHeaders(<String, String>{
              'ngrok-skip-browser-warning': 'true',
            })
            .enableReconnection()
            .setReconnectionAttempts(8)
            .setReconnectionDelay(2000)
            .build(),
      );

      _chatSocket!.on('connect', (_) {
        if (kDebugMode) {
          debugPrint('[chat socket] connected ${_chatSocket?.id}');
        }
      });

      _chatSocket!.on('disconnect', (_) {
        if (kDebugMode) {
          debugPrint('[chat socket] disconnected');
        }
      });

      _chatSocket!.on('connect_error', (err) {
        if (kDebugMode) {
          debugPrint('[chat socket] connect_error: $err');
        }
      });

      _chatSocket!.on('new_message', _onNewMessage);
      _chatSocket!.on('unread_updated', _onUnreadUpdated);

      _chatSocket!.connect();
    } catch (e) {
      if (kDebugMode) {
        debugPrint('[chat socket] init error: $e');
      }
    }
  }

  Future<void> disconnectChatSocket() async {
    if (_chatSocket != null) {
      _chatSocket!.off('new_message');
      _chatSocket!.off('unread_updated');
      _chatSocket!.disconnect();
      _chatSocket!.dispose();
      _chatSocket = null;
    }
  }

  void _onNewMessage(dynamic data) {
    if (data is! Map) return;
    final envelope = Map<String, dynamic>.from(data);
    final conversationId = envelope['conversationId']?.toString();
    if (conversationId == null || conversationId.isEmpty) return;

    final message = _normalizeMessageMap(envelope['message']);
    final id = message['id']?.toString();
    if (id == null || id.isEmpty) return;

    final selected = selectedConversationId.value;
    if (selected == conversationId && view.value == 'chat') {
      final exists = messages.any((e) => e['id']?.toString() == id);
      if (!exists) {
        messages.add(message);
      }
    }

    _bumpConversationToTop(conversationId, message);
  }

  void _bumpConversationToTop(
    String conversationId,
    Map<String, dynamic> message,
  ) {
    final preview = message['content']?.toString() ?? '';
    final idx = conversations.indexWhere((c) => c['id']?.toString() == conversationId);
    if (idx < 0) {
      unawaited(loadConversations());
      return;
    }
    final c = Map<String, dynamic>.from(conversations[idx]);
    c['lastMessagePreview'] = preview;
    conversations.removeAt(idx);
    conversations.insert(0, c);
  }

  void _onUnreadUpdated(dynamic data) {
    if (data is! Map) return;
    final m = Map<String, dynamic>.from(data);
    final conversationId = m['conversationId']?.toString();
    if (conversationId == null || conversationId.isEmpty) return;
    final inc = m['increment'];
    final delta = inc is num ? inc.toInt() : 1;
    _patchConversationUnread(conversationId, delta);
  }

  void _patchConversationUnread(String conversationId, int delta) {
    if (delta == 0) return;
    final idx = conversations.indexWhere((c) => c['id']?.toString() == conversationId);
    if (idx < 0) {
      unawaited(loadConversations());
      return;
    }
    final my = _myUserId;
    if (my == null) return;
    final c = Map<String, dynamic>.from(conversations[idx]);
    final cid = c['customerId']?.toString();
    if (my == cid) {
      final n = c['customerUnreadCount'];
      final cur = n is num ? n.toInt() : int.tryParse('$n') ?? 0;
      c['customerUnreadCount'] = cur + delta;
    } else {
      final n = c['providerUnreadCount'];
      final cur = n is num ? n.toInt() : int.tryParse('$n') ?? 0;
      c['providerUnreadCount'] = cur + delta;
    }
    conversations[idx] = c;
  }

  String _peerTitle(Map<String, dynamic> c) {
    final my = _myUserId;
    final cid = c['customerId']?.toString();
    final isCustomer = my != null && my == cid;
    final other = isCustomer ? c['provider'] : c['customer'];
    if (other is Map) {
      final prof = other['profile'];
      if (prof is Map && prof['fullName'] != null) {
        return prof['fullName'].toString();
      }
      if (other['fullName'] != null) return other['fullName'].toString();
    }
    return isCustomer ? 'Thợ' : 'Khách hàng';
  }

  int _unreadForMe(Map<String, dynamic> c) {
    final my = _myUserId;
    final cid = c['customerId']?.toString();
    if (my == null) return 0;
    if (my == cid) {
      final n = c['customerUnreadCount'];
      return n is num ? n.toInt() : int.tryParse('$n') ?? 0;
    }
    final n = c['providerUnreadCount'];
    return n is num ? n.toInt() : int.tryParse('$n') ?? 0;
  }

  Future<void> loadConversations() async {
    if (!Get.isRegistered<ProfileController>()) return;
    final pc = Get.find<ProfileController>();
    if (pc.profile.value?.id == null) {
      await pc.loadProfile();
    }
    isLoading.value = true;
    errorMessage.value = '';
    try {
      final raw = await _api.listConversations();
      final list = _asMapList(raw);
      conversations.assignAll(list);
    } catch (e) {
      errorMessage.value = e.toString();
      conversations.clear();
    } finally {
      isLoading.value = false;
    }
  }

  void openConversation(String id) {
    selectedConversationId.value = id;
    view.value = 'chat';
    loadMessages(id);
    _api.markConversationRead(id).catchError((_) {});
    _chatSocket?.emit('join_conversation', {'conversationId': id});
  }

  void backToList() {
    view.value = 'list';
    selectedConversationId.value = null;
    messages.clear();
    loadConversations();
  }

  Future<void> loadMessages(String conversationId, {String? before}) async {
    isLoading.value = true;
    errorMessage.value = '';
    try {
      final raw = await _api.getMessages(
        conversationId,
        limit: 50,
        before: before,
      );
      Map<String, dynamic>? map;
      if (raw is Map) {
        map = Map<String, dynamic>.from(raw);
      }
      final list = _asMapList(map?['messages']);
      final hm = map?['hasMore'];
      hasMoreMessages.value = hm is bool ? hm : false;
      if (before == null) {
        messages.assignAll(list);
      } else {
        messages.insertAll(0, list);
      }
    } catch (e) {
      errorMessage.value = e.toString();
    } finally {
      isLoading.value = false;
    }
  }

  bool isMine(Map<String, dynamic> m) {
    final sid = m['senderId']?.toString();
    final my = _myUserId;
    return my != null && sid == my;
  }

  String messageBody(Map<String, dynamic> m) {
    final t = m['type']?.toString() ?? '';
    final c = m['content']?.toString() ?? '';
    if (t == 'system') return c.isEmpty ? '[Hệ thống]' : c;
    return c.isEmpty ? '[$t]' : c;
  }

  Future<void> sendText(String text) async {
    final id = selectedConversationId.value;
    if (id == null || text.trim().isEmpty) return;
    isSending.value = true;
    try {
      await _api.sendMessage(
        id,
        type: 'text',
        content: text.trim(),
      );
      await loadMessages(id);
    } catch (e) {
      Get.snackbar('Lỗi', e.toString());
    } finally {
      isSending.value = false;
    }
  }

  Future<void> closeCurrentConversation() async {
    final id = selectedConversationId.value;
    if (id == null) return;
    try {
      await _api.closeConversation(id);
      Get.snackbar('Đã đóng', 'Cuộc trò chuyện đã đóng');
      backToList();
    } catch (e) {
      Get.snackbar('Lỗi', e.toString());
    }
  }

  Future<void> deleteCurrentConversation() async {
    final id = selectedConversationId.value;
    if (id == null) return;
    final ok = await Get.dialog<bool>(
      AlertDialog(
        title: const Text('Xóa hội thoại'),
        content: const Text('Xóa vĩnh viễn cuộc trò chuyện này?'),
        actions: [
          TextButton(onPressed: () => Get.back(result: false), child: const Text('Hủy')),
          FilledButton(onPressed: () => Get.back(result: true), child: const Text('Xóa')),
        ],
      ),
    );
    if (ok != true) return;
    try {
      await _api.deleteConversation(id);
      Get.snackbar('Đã xóa', '');
      backToList();
    } catch (e) {
      Get.snackbar('Lỗi', e.toString());
    }
  }

  Map<String, dynamic>? get selectedConversation {
    final id = selectedConversationId.value;
    if (id == null) return null;
    for (final c in conversations) {
      if (c['id']?.toString() == id) return c;
    }
    return null;
  }

  String titleFor(Map<String, dynamic> c) => _peerTitle(c);

  int unreadFor(Map<String, dynamic> c) => _unreadForMe(c);

  String previewFor(Map<String, dynamic> c) =>
      c['lastMessagePreview']?.toString() ?? '';

  @override
  void onClose() {
    disconnectChatSocket();
    super.onClose();
  }
}
