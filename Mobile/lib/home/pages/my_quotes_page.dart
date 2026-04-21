import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile_app_doan/home/controllers/order_controller.dart';
import 'package:mobile_app_doan/home/controllers/quote_controller.dart';
import 'package:mobile_app_doan/home/utils/parse_api_list.dart';
import 'package:openapi/openapi.dart';

/// Danh sách báo giá của thợ (OpenAPI GET /quotes/my-quotes).
class MyQuotesPage extends StatefulWidget {
  const MyQuotesPage({super.key});

  @override
  State<MyQuotesPage> createState() => _MyQuotesPageState();
}

class _MyQuotesPageState extends State<MyQuotesPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Get.find<QuoteController>().loadMyQuotes();
    });
  }

  String _quoteId(Map<String, dynamic> q) =>
      (q['id'] ?? q['_id'] ?? '').toString();

  String _title(Map<String, dynamic> q) {
    final price = q['price'];
    final st = q['status'] ?? q['state'];
    return 'Giá: ${price ?? '—'}${st != null ? ' · $st' : ''}';
  }

  String _subtitle(Map<String, dynamic> q) {
    return stringField(q, ['description', 'message', 'title']);
  }

  @override
  Widget build(BuildContext context) {
    final qc = Get.find<QuoteController>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Báo giá đã gửi'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => qc.loadMyQuotes(),
          ),
        ],
      ),
      body: Obx(() {
        if (qc.isLoading.value && qc.myQuotes.isEmpty) {
          return const Center(child: CircularProgressIndicator());
        }
        if (qc.myQuotes.isEmpty) {
          return Center(
            child: Text(
              qc.errorMessage.value.isEmpty
                  ? 'Chưa có báo giá'
                  : qc.errorMessage.value,
              textAlign: TextAlign.center,
            ),
          );
        }
        return ListView.separated(
          padding: const EdgeInsets.all(12),
          itemCount: qc.myQuotes.length,
          separatorBuilder: (_, __) => const SizedBox(height: 8),
          itemBuilder: (context, i) {
            final q = qc.myQuotes[i];
            final id = _quoteId(q);
            return Card(
              child: ListTile(
                title: Text(_title(q)),
                subtitle: Text(
                  _subtitle(q).isEmpty ? '—' : _subtitle(q),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                isThreeLine: true,
                trailing: PopupMenuButton<String>(
                  onSelected: (v) async {
                    if (id.isEmpty) return;
                    if (v == 'confirm_order') {
                      await Get.find<OrderController>().confirmFromQuote(id);
                      await qc.loadMyQuotes();
                    } else if (v == 'revise') {
                      final priceCtrl = TextEditingController(
                        text: q['price']?.toString() ?? '',
                      );
                      final reasonCtrl = TextEditingController();
                      final ok = await showDialog<bool>(
                        context: context,
                        builder: (ctx) => AlertDialog(
                          title: const Text('Chào giá lại'),
                          content: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              TextField(
                                controller: priceCtrl,
                                keyboardType: TextInputType.number,
                                decoration: const InputDecoration(
                                  labelText: 'Giá mới *',
                                ),
                              ),
                              TextField(
                                controller: reasonCtrl,
                                decoration: const InputDecoration(
                                  labelText: 'Lý do thay đổi',
                                ),
                              ),
                            ],
                          ),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.pop(ctx, false),
                              child: const Text('Hủy'),
                            ),
                            FilledButton(
                              onPressed: () => Navigator.pop(ctx, true),
                              child: const Text('Gửi'),
                            ),
                          ],
                        ),
                      );
                      if (ok == true && context.mounted) {
                        final p = num.tryParse(priceCtrl.text.trim());
                        if (p == null) {
                          Get.snackbar('Lỗi', 'Giá không hợp lệ');
                          return;
                        }
                        await qc.reviseQuote(
                          id,
                          price: p,
                          changeReason: reasonCtrl.text.trim().isEmpty
                              ? null
                              : reasonCtrl.text.trim(),
                        );
                        await qc.loadMyQuotes();
                      }
                    } else if (v == 'edit') {
                      final priceCtrl = TextEditingController(
                        text: q['price']?.toString() ?? '',
                      );
                      final descCtrl = TextEditingController(
                        text: q['description']?.toString() ?? '',
                      );
                      final ok = await showDialog<bool>(
                        context: context,
                        builder: (ctx) => AlertDialog(
                          title: const Text('Sửa báo giá'),
                          content: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              TextField(
                                controller: priceCtrl,
                                keyboardType: TextInputType.number,
                                decoration: const InputDecoration(
                                  labelText: 'Giá',
                                ),
                              ),
                              TextField(
                                controller: descCtrl,
                                maxLines: 3,
                                decoration: const InputDecoration(
                                  labelText: 'Mô tả',
                                ),
                              ),
                            ],
                          ),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.pop(ctx, false),
                              child: const Text('Hủy'),
                            ),
                            FilledButton(
                              onPressed: () => Navigator.pop(ctx, true),
                              child: const Text('Lưu'),
                            ),
                          ],
                        ),
                      );
                      if (ok == true && context.mounted) {
                        final dto = UpdateQuoteDto(
                          (b) => b
                            ..price = num.tryParse(priceCtrl.text.trim())
                            ..description = descCtrl.text.trim().isEmpty
                                ? null
                                : descCtrl.text.trim(),
                        );
                        await qc.updateQuote(id, dto);
                        await qc.loadMyQuotes();
                      }
                    } else if (v == 'cancel') {
                      await qc.cancelQuoteById(id);
                    } else if (v == 'delete') {
                      await qc.deleteQuoteById(id);
                    }
                  },
                  itemBuilder: (ctx) {
                    final st = (q['status'] ?? q['state'] ?? '')
                        .toString()
                        .toLowerCase();
                    final items = <PopupMenuEntry<String>>[];
                    if (st == 'order_requested') {
                      items.add(
                        const PopupMenuItem(
                          value: 'confirm_order',
                          child: Text('Xác nhận tạo đơn'),
                        ),
                      );
                    }
                    if (st == 'accepted_for_chat' || st == 'revising') {
                      items.add(
                        const PopupMenuItem(
                          value: 'revise',
                          child: Text('Chào giá lại'),
                        ),
                      );
                    }
                    if (st == 'pending') {
                      items.add(const PopupMenuItem(value: 'edit', child: Text('Sửa')));
                    }
                    items.addAll(const [
                      PopupMenuItem(value: 'cancel', child: Text('Hủy báo giá')),
                      PopupMenuItem(value: 'delete', child: Text('Xóa')),
                    ]);
                    return items;
                  },
                ),
              ),
            );
          },
        );
      }),
    );
  }
}
