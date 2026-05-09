import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile_app_doan/home/controllers/chat_controller.dart';
import 'package:mobile_app_doan/home/controllers/mobile_shell_controller.dart';
import 'package:mobile_app_doan/home/controllers/post_controller.dart';
import 'package:mobile_app_doan/home/pages/order_detail_page.dart';
import 'package:mobile_app_doan/home/utils/parse_api_list.dart';
import 'package:mobile_app_doan/home/widgets/post_detail_bottom_sheet.dart';
import 'package:mobile_app_doan/home/widgets/post_quotes_sheet.dart';

/// Lấy path từ [actionUrl] backend (relative hoặc URL đầy đủ).
String? _pathFromActionUrl(String raw) {
  final t = raw.trim();
  if (t.isEmpty) return null;
  final uri = Uri.tryParse(t);
  if (uri != null &&
      uri.hasScheme &&
      uri.host.isNotEmpty &&
      uri.path.isNotEmpty) {
    return uri.path;
  }
  final noQuery = t.split('?').first.trim();
  if (noQuery.startsWith('/')) return noQuery;
  if (noQuery.isEmpty) return null;
  return '/$noQuery';
}

Map<String, dynamic> _metadataMap(Map<String, dynamic> item) {
  final meta = item['metadata'];
  if (meta is Map) return Map<String, dynamic>.from(meta);
  return {};
}

String? _metaGet(Map<String, dynamic> m, List<String> keys) {
  for (final k in keys) {
    final v = m[k];
    if (v != null && v.toString().isNotEmpty) return v.toString();
  }
  return null;
}

Future<void> _openPostDetailById(BuildContext context, String postId) async {
  if (postId.isEmpty || !Get.isRegistered<PostController>()) return;
  showDialog<void>(
    context: context,
    barrierDismissible: false,
    builder: (ctx) => const PopScope(
      canPop: false,
      child: Center(child: CircularProgressIndicator()),
    ),
  );
  try {
    final post =
        await Get.find<PostController>().repository.getaPost(postId);
    if (context.mounted) Navigator.of(context).pop();
    if (context.mounted) await showPostDetailBottomSheet(context, post);
  } catch (_) {
    if (context.mounted) Navigator.of(context).pop();
    if (context.mounted) {
      Get.snackbar('Không mở được bài đăng', 'Vui lòng thử lại sau.');
    }
  }
}

Future<void> _openChatByConversationId(String conversationId) async {
  if (!Get.isRegistered<ChatController>()) return;
  final chat = Get.find<ChatController>();
  await chat.loadConversations();
  chat.openConversation(conversationId);
  if (Get.isRegistered<MobileShellController>()) {
    Get.find<MobileShellController>().goToTab(2);
  }
}

/// Điều hướng theo thông báo (khớp [actionUrl] / [type] + [metadata] từ backend).
Future<void> openScreenForNotification(
  BuildContext context,
  Map<String, dynamic> item,
) async {
  final m = _metadataMap(item);
  final type = stringField(item, ['type']).toLowerCase().trim();
  final actionRaw = stringField(item, ['actionUrl', 'action_url']);
  final path = _pathFromActionUrl(actionRaw);

  if (path != null) {
    final pq = RegExp(r'^/posts/([^/]+)/quotes/?$').firstMatch(path);
    if (pq != null) {
      await showPostQuotesSheet(context, pq.group(1)!);
      return;
    }

    final po = RegExp(r'^/posts/([^/]+)/?$').firstMatch(path);
    if (po != null) {
      await _openPostDetailById(context, po.group(1)!);
      return;
    }

    final cq = RegExp(r'^/chat/quote/([^/]+)/?$').firstMatch(path);
    if (cq != null) {
      await navigateToQuoteChat(cq.group(1)!);
      return;
    }

    final qo = RegExp(r'^/quotes/([^/]+)/?$').firstMatch(path);
    if (qo != null) {
      await Get.toNamed<void>('/my-quotes');
      return;
    }

    final ord = RegExp(r'^/orders/([^/]+)/?$').firstMatch(path);
    if (ord != null) {
      await Get.to<void>(() => OrderDetailPage(orderId: ord.group(1)!));
      return;
    }

    final ch = RegExp(r'^/chats/([^/]+)/?$').firstMatch(path);
    if (ch != null) {
      await _openChatByConversationId(ch.group(1)!);
      return;
    }

    final rev = RegExp(r'^/reviews/([^/]+)/?$').firstMatch(path);
    if (rev != null) {
      await Get.toNamed<void>('/my-reviews');
      return;
    }

    final cr =
        RegExp(r'^/custom-requests/([^/]+)(?:/quote)?/?$').firstMatch(path);
    if (cr != null) {
      await Get.toNamed<void>('/custom-requests');
      return;
    }
  }

  // Fallback theo type khi thiếu actionUrl
  final postId = _metaGet(m, ['postId', 'post_id']);
  final quoteId = _metaGet(m, ['quoteId', 'quote_id']);
  final orderId = _metaGet(m, ['orderId', 'order_id']);
  final chatId = _metaGet(m, ['chatId', 'conversationId', 'conversation_id']);

  switch (type) {
    case 'new_quote_received':
      if (postId != null) await showPostQuotesSheet(context, postId);
      return;
    case 'quote_revised':
      if (quoteId != null) {
        await navigateToQuoteChat(quoteId);
      } else if (postId != null) {
        await showPostQuotesSheet(context, postId);
      }
      return;
    case 'quote_accepted_for_chat':
    case 'quote_accepted':
      if (quoteId != null) await navigateToQuoteChat(quoteId);
      return;
    case 'quote_rejected':
    case 'order_requested':
      await Get.toNamed<void>('/my-quotes');
      return;
    case 'quote_cancelled':
      if (postId != null) await _openPostDetailById(context, postId);
      return;
    case 'order_created':
    case 'order_in_progress':
    case 'order_completed':
    case 'order_cancelled':
    case 'order_awaiting_confirmation':
    case 'payment_received':
    case 'payment_failed':
    case 'refund_processed':
      if (orderId != null) {
        await Get.to<void>(() => OrderDetailPage(orderId: orderId));
      } else {
        await Get.toNamed<void>('/orders');
      }
      return;
    case 'post_closed':
    case 'post_updated':
      if (postId != null) await _openPostDetailById(context, postId);
      return;
    case 'new_message':
      if (chatId != null) await _openChatByConversationId(chatId);
      return;
    case 'new_review_received':
    case 'review_reply_received':
      await Get.toNamed<void>('/my-reviews');
      return;
    case 'direct_request_received':
    case 'direct_request_accepted':
    case 'direct_request_rejected':
      await Get.toNamed<void>('/custom-requests');
      return;
    default:
      return;
  }
}
