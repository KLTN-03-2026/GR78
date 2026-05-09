import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:mobile_app_doan/home/controllers/chat_controller.dart';
import 'package:mobile_app_doan/home/controllers/mobile_shell_controller.dart';
import 'package:mobile_app_doan/home/controllers/quote_controller.dart';
import 'package:mobile_app_doan/home/utils/parse_api_list.dart';

/// Sau [accept-for-chat]: chuyển tab Tin nhắn và mở hội thoại theo [quoteId].
Future<void> navigateToQuoteChat(String quoteId) async {
  if (!Get.isRegistered<ChatController>()) return;
  final chat = Get.find<ChatController>();
  await chat.loadConversations();

  String? conversationIdForQuote() {
    for (final c in chat.conversations) {
      final qid = c['quoteId'] ?? c['quote_id'];
      if (qid?.toString() == quoteId) {
        return c['id']?.toString();
      }
    }
    return null;
  }

  var convId = conversationIdForQuote();
  if (convId == null || convId.isEmpty) {
    await Future<void>.delayed(const Duration(milliseconds: 400));
    await chat.loadConversations();
    convId = conversationIdForQuote();
  }
  if (convId != null && convId.isNotEmpty) {
    chat.openConversation(convId);
  }
  if (Get.isRegistered<MobileShellController>()) {
    Get.find<MobileShellController>().goToTab(2);
  }
}

/// Bottom sheet: các chào giá theo bài đăng (khách) — GET /quotes/post/:postId.
Future<void> showPostQuotesSheet(BuildContext context, String postId) async {
  await showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
    ),
    builder: (ctx) {
      return _PostQuotesBody(postId: postId);
    },
  );
}

class _PostQuotesBody extends StatefulWidget {
  final String postId;

  const _PostQuotesBody({required this.postId});

  @override
  State<_PostQuotesBody> createState() => _PostQuotesBodyState();
}

class _PostQuotesBodyState extends State<_PostQuotesBody> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Get.find<QuoteController>().loadPostQuotes(widget.postId);
    });
  }

  String _id(Map<String, dynamic> q) =>
      (q['id'] ?? q['_id'] ?? '').toString();

  String _normStatus(Map<String, dynamic> q) {
    return (q['status'] ?? q['state'] ?? '').toString().toLowerCase().trim();
  }

  bool _isPending(String s) => s == 'pending';

  bool _isNegotiating(String s) =>
      s == 'accepted_for_chat' || s == 'revising';

  bool _noCustomerActions(String s) {
    return s == 'rejected' ||
        s == 'cancelled' ||
        s == 'order_requested' ||
        s == 'confirmed' ||
        s == 'expired' ||
        s == 'accepted';
  }

  @override
  Widget build(BuildContext context) {
    final qc = Get.find<QuoteController>();
    final h = MediaQuery.sizeOf(context).height * 0.65;
    final scheme = Theme.of(context).colorScheme;
    final money = NumberFormat.decimalPattern('vi_VN');

    return SizedBox(
      height: h,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Text(
              'Các chào giá',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
          ),
          Expanded(
            child: Obx(() {
              final busyQuotes = qc.isLoading.value;
              if (busyQuotes && qc.postQuotes.isEmpty) {
                return const Center(child: CircularProgressIndicator());
              }
              if (qc.postQuotes.isEmpty) {
                return Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Text(
                      qc.errorMessage.value.isEmpty
                          ? 'Chưa có chào giá'
                          : qc.errorMessage.value,
                      textAlign: TextAlign.center,
                    ),
                  ),
                );
              }
              return ListView.builder(
                padding: const EdgeInsets.fromLTRB(12, 0, 12, 16),
                itemCount: qc.postQuotes.length,
                itemBuilder: (context, i) {
                  final q = qc.postQuotes[i];
                  final id = _id(q);
                  final status = _normStatus(q);
                  final price = q['price'];
                  final priceStr = price is num
                      ? '${money.format(price is int ? price : price.toInt())} đ'
                      : (price?.toString() ?? '—');
                  final desc = stringField(q, ['description', 'message']);
                  final busy = busyQuotes;
                  final pending = _isPending(status);
                  final negotiating = _isNegotiating(status);
                  final finished = _noCustomerActions(status);
                  final exchangeEnabled =
                      !busyQuotes && !finished && (pending || negotiating);
                  final acceptOrderEnabled =
                      !busyQuotes && !finished && (pending || negotiating);
                  final rejectEnabled = !busyQuotes && !finished && pending;

                  return Card(
                    margin: const EdgeInsets.only(bottom: 10),
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            priceStr,
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                          if (status.isNotEmpty)
                            Padding(
                              padding: const EdgeInsets.only(top: 4),
                              child: Text(
                                'Trạng thái: $status',
                                style: TextStyle(
                                  color: scheme.onSurfaceVariant,
                                  fontSize: 13,
                                ),
                              ),
                            ),
                          if (desc.isNotEmpty) ...[
                            const SizedBox(height: 6),
                            Text(desc),
                          ],
                          if (id.isNotEmpty) ...[
                            const SizedBox(height: 12),
                            _QuoteCustomerActions(
                              busy: busy,
                              exchangeEnabled: exchangeEnabled,
                              acceptOrderEnabled: acceptOrderEnabled,
                              rejectEnabled: rejectEnabled,
                              onAccept: () async {
                                final ok = pending
                                    ? await qc.acceptQuoteDirect(id)
                                    : await qc.requestOrder(id);
                                if (!ok || !context.mounted) return;
                                await qc.loadPostQuotes(widget.postId);
                                if (!context.mounted) return;
                                Navigator.of(context).pop();
                                Get.toNamed<void>('/orders');
                              },
                              onExchange: () async {
                                if (pending) {
                                  final ok = await qc.acceptQuote(id);
                                  if (!ok || !context.mounted) return;
                                }
                                if (!context.mounted) return;
                                if (Navigator.of(context).canPop()) {
                                  Navigator.of(context).pop();
                                }
                                await navigateToQuoteChat(id);
                              },
                              onReject: () async {
                                final reasonCtrl = TextEditingController();
                                final ok = await showDialog<bool>(
                                  context: context,
                                  builder: (dctx) => AlertDialog(
                                    title: const Text('Từ chối chào giá'),
                                    content: TextField(
                                      controller: reasonCtrl,
                                      decoration: const InputDecoration(
                                        labelText: 'Lý do (tuỳ chọn)',
                                      ),
                                    ),
                                    actions: [
                                      TextButton(
                                        onPressed: () =>
                                            Navigator.pop(dctx, false),
                                        child: const Text('Hủy'),
                                      ),
                                      FilledButton(
                                        onPressed: () =>
                                            Navigator.pop(dctx, true),
                                        child: const Text('Từ chối'),
                                      ),
                                    ],
                                  ),
                                );
                                final reason = ok == true &&
                                        reasonCtrl.text.trim().isNotEmpty
                                    ? reasonCtrl.text.trim()
                                    : null;
                                reasonCtrl.dispose();
                                if (ok == true && context.mounted) {
                                  await qc.rejectQuote(id, reason: reason);
                                  if (context.mounted) {
                                    await qc.loadPostQuotes(widget.postId);
                                  }
                                }
                              },
                            ),
                          ],
                        ],
                      ),
                    ),
                  );
                },
              );
            }),
          ),
        ],
      ),
    );
  }
}

/// Trao đổi thêm → chat · Chấp nhận → đặt đơn (pending: ngay; sau chat: request-order) · Từ chối → reject.
class _QuoteCustomerActions extends StatelessWidget {
  const _QuoteCustomerActions({
    required this.busy,
    required this.exchangeEnabled,
    required this.acceptOrderEnabled,
    required this.rejectEnabled,
    required this.onAccept,
    required this.onExchange,
    required this.onReject,
  });

  final bool busy;
  final bool exchangeEnabled;
  final bool acceptOrderEnabled;
  final bool rejectEnabled;
  final VoidCallback onAccept;
  final VoidCallback onExchange;
  final VoidCallback onReject;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Expanded(
              child: Tooltip(
                message: busy
                    ? 'Đang xử lý…'
                    : (!exchangeEnabled
                        ? 'Không thể trao đổi ở trạng thái này.'
                        : 'Mở chat với thợ để trao đổi thêm; chốt giá rồi mới bấm Chấp nhận để lên đơn.'),
                child: FilledButton(
                  onPressed: exchangeEnabled && !busy ? onExchange : null,
                  style: FilledButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    visualDensity: VisualDensity.compact,
                  ),
                  child: const Text(
                    'Trao đổi thêm',
                    textAlign: TextAlign.center,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Tooltip(
                message: busy
                    ? 'Đang xử lý…'
                    : (!acceptOrderEnabled
                        ? 'Không thể đặt đơn ở trạng thái này.'
                        : 'Tạo đơn hàng theo giá chào hiện tại (đã trao đổi xong thì bấm để lên đơn).'),
                child: FilledButton.tonal(
                  onPressed: acceptOrderEnabled && !busy ? onAccept : null,
                  style: FilledButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    visualDensity: VisualDensity.compact,
                  ),
                  child: const Text(
                    'Chấp nhận',
                    textAlign: TextAlign.center,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Tooltip(
                message: busy
                    ? 'Đang xử lý…'
                    : (!rejectEnabled
                        ? 'Chỉ từ chối được khi chào giá đang chờ (pending).'
                        : 'Từ chối chào giá này.'),
                child: OutlinedButton(
                  onPressed: rejectEnabled && !busy ? onReject : null,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: scheme.error,
                    side: BorderSide(color: scheme.outline),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    visualDensity: VisualDensity.compact,
                  ),
                  child: const Text(
                    'Từ chối',
                    textAlign: TextAlign.center,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),
        Text(
          'Trao đổi thêm → chat với thợ · Chấp nhận → tạo đơn (có thể ngay hoặc sau khi chốt giá) · Từ chối → bỏ chào giá',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: scheme.onSurfaceVariant,
              ),
        ),
      ],
    );
  }
}
