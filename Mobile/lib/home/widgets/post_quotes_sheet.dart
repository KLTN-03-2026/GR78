import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile_app_doan/home/controllers/quote_controller.dart';
import 'package:mobile_app_doan/home/utils/parse_api_list.dart';

/// Bottom sheet: báo giá theo bài đăng (customer) — OpenAPI GET /quotes/post/{postId}.
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

  @override
  Widget build(BuildContext context) {
    final qc = Get.find<QuoteController>();
    final h = MediaQuery.sizeOf(context).height * 0.65;

    return SizedBox(
      height: h,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Padding(
            padding: EdgeInsets.all(16),
            child: Text(
              'Báo giá cho bài đăng',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
          ),
          Expanded(
            child: Obx(() {
              if (qc.isLoading.value && qc.postQuotes.isEmpty) {
                return const Center(child: CircularProgressIndicator());
              }
              if (qc.postQuotes.isEmpty) {
                return Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Text(
                      qc.errorMessage.value.isEmpty
                          ? 'Chưa có báo giá'
                          : qc.errorMessage.value,
                      textAlign: TextAlign.center,
                    ),
                  ),
                );
              }
              return ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                itemCount: qc.postQuotes.length,
                itemBuilder: (context, i) {
                  final q = qc.postQuotes[i];
                  final id = _id(q);
                  final price = q['price'];
                  final desc = stringField(q, ['description', 'message']);
                          final status = (q['status'] ?? q['state'] ?? '')
                              .toString()
                              .toLowerCase();
                          final canRequestOrder = status == 'accepted_for_chat' ||
                              status == 'revising';
                          return Card(
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Giá: $price',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          if (status.toString().isNotEmpty)
                            Text('Trạng thái: $status'),
                          if (desc.isNotEmpty) Text(desc),
                          if (id.isNotEmpty) ...[
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                TextButton(
                                  onPressed: qc.isLoading.value
                                      ? null
                                      : () async {
                                          await qc.acceptQuote(id);
                                          await qc
                                              .loadPostQuotes(widget.postId);
                                        },
                                  child: const Text('Chấp nhận'),
                                ),
                                if (canRequestOrder)
                                  TextButton(
                                    onPressed: qc.isLoading.value
                                        ? null
                                        : () async {
                                            await qc.requestOrder(id);
                                            await qc.loadPostQuotes(
                                              widget.postId,
                                            );
                                          },
                                    child: const Text('Yêu cầu đặt đơn'),
                                  ),
                                TextButton(
                                  onPressed: qc.isLoading.value
                                      ? null
                                      : () async {
                                          final reasonCtrl =
                                              TextEditingController();
                                          final ok = await showDialog<bool>(
                                            context: context,
                                            builder: (dctx) => AlertDialog(
                                              title: const Text('Từ chối'),
                                              content: TextField(
                                                controller: reasonCtrl,
                                                decoration:
                                                    const InputDecoration(
                                                  labelText: 'Lý do (tuỳ chọn)',
                                                ),
                                              ),
                                              actions: [
                                                TextButton(
                                                  onPressed: () =>
                                                      Navigator.pop(
                                                    dctx,
                                                    false,
                                                  ),
                                                  child: const Text('Hủy'),
                                                ),
                                                FilledButton(
                                                  onPressed: () =>
                                                      Navigator.pop(
                                                    dctx,
                                                    true,
                                                  ),
                                                  child: const Text('Từ chối'),
                                                ),
                                              ],
                                            ),
                                          );
                                          if (ok == true && context.mounted) {
                                            await qc.rejectQuote(
                                              id,
                                              reason: reasonCtrl.text
                                                  .trim()
                                                  .isEmpty
                                                  ? null
                                                  : reasonCtrl.text.trim(),
                                            );
                                            await qc.loadPostQuotes(
                                              widget.postId,
                                            );
                                          }
                                        },
                                  child: const Text('Từ chối'),
                                ),
                              ],
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
