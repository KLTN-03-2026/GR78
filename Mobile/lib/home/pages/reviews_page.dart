import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile_app_doan/core/theme/app_spacing.dart';
import 'package:mobile_app_doan/core/widgets/app_empty_state.dart';
import 'package:mobile_app_doan/core/widgets/app_list_skeleton.dart';
import 'package:mobile_app_doan/core/user_role_context.dart';
import 'package:mobile_app_doan/core/widgets/app_page_header.dart';
import 'package:mobile_app_doan/home/controllers/review_controller.dart';
import 'package:mobile_app_doan/home/controllers/user_controller.dart';

class MyReviewsPage extends StatefulWidget {
  const MyReviewsPage({super.key});

  @override
  State<MyReviewsPage> createState() => _MyReviewsPageState();
}

class _MyReviewsPageState extends State<MyReviewsPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Get.find<ReviewController>().loadMyReviews();
    });
  }

  @override
  Widget build(BuildContext context) {
    final rc = Get.find<ReviewController>();

    final scheme = Theme.of(context).colorScheme;
    return Scaffold(
      backgroundColor: scheme.surfaceContainerLowest,
      body: Column(
        children: [
          AppPageHeader(
            title: 'Đánh giá của tôi',
            subtitle: 'Các đánh giá bạn đã gửi sau khi hoàn thành đơn',
            trailing: [
              IconButton(
                tooltip: 'Làm mới',
                icon: const Icon(Icons.refresh, color: Colors.white),
                onPressed: () => rc.loadMyReviews(),
              ),
            ],
          ),
          Expanded(
            child: Obx(() {
              if (rc.isLoading.value && rc.reviews.isEmpty) {
                return const AppListSkeleton(itemCount: 4);
              }
              if (rc.reviews.isEmpty) {
                return AppEmptyState(
                  title: 'Chưa có đánh giá nào',
                  subtitle: 'Bạn chưa đánh giá đơn hàng nào.',
                  icon: Icons.star_outline,
                  actionLabel: 'Làm mới',
                  onAction: () => rc.loadMyReviews(),
                );
              }
              return ListView.separated(
                padding: const EdgeInsets.all(AppSpacing.sm),
                itemCount: rc.reviews.length,
                separatorBuilder: (_, __) =>
                    const SizedBox(height: AppSpacing.xs),
                itemBuilder: (ctx, i) => ReviewCard(
                  review: rc.reviews[i],
                  showReplyButton: false,
                ),
              );
            }),
          ),
        ],
      ),
    );
  }
}

class ProviderReviewsPage extends StatefulWidget {
  const ProviderReviewsPage({super.key, required this.providerId});
  final String providerId;

  @override
  State<ProviderReviewsPage> createState() => _ProviderReviewsPageState();
}

class _ProviderReviewsPageState extends State<ProviderReviewsPage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Get.find<ReviewController>().loadProviderReviews(widget.providerId);
    });
  }

  bool _viewerCanReplyAsProvider() {
    if (!currentUserIsProvider()) return false;
    if (!Get.isRegistered<ProfileController>()) return false;
    final mine = Get.find<ProfileController>().profile.value?.id;
    final pid = widget.providerId.trim();
    return mine != null && mine == pid;
  }

  @override
  Widget build(BuildContext context) {
    final rc = Get.find<ReviewController>();
    final scheme = Theme.of(context).colorScheme;
    return Obx(() {
      if (Get.isRegistered<ProfileController>()) {
        Get.find<ProfileController>().profile.value;
      }
      final canReply = _viewerCanReplyAsProvider();
      return Scaffold(
        backgroundColor: scheme.surfaceContainerLowest,
        body: Column(
          children: [
            AppPageHeader(
              title: 'Đánh giá thợ',
              trailing: [
                IconButton(
                  tooltip: 'Làm mới',
                  icon: const Icon(Icons.refresh, color: Colors.white),
                  onPressed: () =>
                      rc.loadProviderReviews(widget.providerId.trim()),
                ),
              ],
              bottom: Obx(() {
                final avg = rc.averageRating;
                if (avg == null) return const SizedBox.shrink();
                return Row(
                  children: [
                    const Icon(Icons.star, color: Colors.amber, size: 20),
                    const SizedBox(width: 6),
                    Text(
                      '${avg.toStringAsFixed(1)} / 5',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      '(${rc.total} đánh giá)',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.88),
                        fontSize: 13,
                      ),
                    ),
                  ],
                );
              }),
            ),
            Expanded(
              child: Obx(() {
                if (rc.isLoading.value && rc.reviews.isEmpty) {
                  return const AppListSkeleton(itemCount: 4);
                }
                if (rc.reviews.isEmpty) {
                  return const AppEmptyState(
                    title: 'Thợ chưa có đánh giá',
                    icon: Icons.star_outline,
                  );
                }
                return ListView.separated(
                  padding: const EdgeInsets.all(AppSpacing.sm),
                  itemCount: rc.reviews.length,
                  separatorBuilder: (_, __) =>
                      const SizedBox(height: AppSpacing.xs),
                  itemBuilder: (ctx, i) => ReviewCard(
                    review: rc.reviews[i],
                    showReplyButton: canReply,
                    onReplied: canReply
                        ? () =>
                            rc.loadProviderReviews(widget.providerId.trim())
                        : null,
                  ),
                );
              }),
            ),
          ],
        ),
      );
    });
  }
}

class ReviewCard extends StatelessWidget {
  const ReviewCard({
    super.key,
    required this.review,
    this.showReplyButton = false,
    this.onReplied,
  });

  final Map<String, dynamic> review;
  final bool showReplyButton;
  final VoidCallback? onReplied;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final rating = (review['rating'] as num?)?.toInt() ?? 0;
    final comment = review['comment']?.toString() ?? '';
    final reply = review['providerReply']?.toString() ?? '';
    final reviewer = review['reviewer'];
    final reviewerName = (reviewer is Map)
        ? (reviewer['displayName'] ?? reviewer['fullName'] ?? 'Ẩn danh').toString()
        : 'Ẩn danh';

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.sm),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 18,
                  backgroundColor: scheme.primaryContainer,
                  child: Text(
                    reviewerName.isNotEmpty ? reviewerName[0].toUpperCase() : '?',
                    style: TextStyle(color: scheme.primary),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    reviewerName,
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                ),
                Row(
                  children: List.generate(
                    5,
                    (i) => Icon(
                      i < rating ? Icons.star : Icons.star_outline,
                      color: Colors.amber,
                      size: 16,
                    ),
                  ),
                ),
              ],
            ),
            if (comment.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(comment),
            ],
            if (reply.isNotEmpty) ...[
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(AppSpacing.xs + 4),
                decoration: BoxDecoration(
                  color: scheme.surfaceContainerHighest,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.reply, size: 16, color: scheme.primary),
                    const SizedBox(width: 6),
                    Expanded(child: Text(reply, style: const TextStyle(fontStyle: FontStyle.italic))),
                  ],
                ),
              ),
            ],
            if (showReplyButton && reply.isEmpty) ...[
              const SizedBox(height: 8),
              TextButton.icon(
                onPressed: () => _showReplyDialog(
                  context,
                  review['id']?.toString() ?? '',
                  onReplied,
                ),
                icon: const Icon(Icons.reply, size: 16),
                label: const Text('Phản hồi'),
              ),
            ],
          ],
        ),
      ),
    );
  }

  void _showReplyDialog(
    BuildContext context,
    String reviewId,
    VoidCallback? onReplied,
  ) {
    final ctrl = TextEditingController();
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Phản hồi đánh giá'),
        content: TextField(
          controller: ctrl,
          maxLines: 3,
          decoration: const InputDecoration(
            labelText: 'Nội dung phản hồi',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Hủy'),
          ),
          FilledButton(
            onPressed: () async {
              final text = ctrl.text.trim();
              if (text.isEmpty) return;
              Navigator.pop(ctx);
              final ok =
                  await Get.find<ReviewController>().addReply(reviewId, text);
              if (ok && onReplied != null) onReplied();
            },
            child: const Text('Gửi'),
          ),
        ],
      ),
    );
  }
}

/// Popup đánh giá — gọi từ OrderDetailPage khi đơn COMPLETED
class CreateReviewSheet extends StatefulWidget {
  const CreateReviewSheet({super.key, required this.orderId});
  final String orderId;

  @override
  State<CreateReviewSheet> createState() => _CreateReviewSheetState();
}

class _CreateReviewSheetState extends State<CreateReviewSheet> {
  int _rating = 5;
  final _comment = TextEditingController();
  bool _busy = false;

  @override
  void dispose() {
    _comment.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 20, right: 20, top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('Đánh giá đơn hàng', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(
              5,
              (i) => GestureDetector(
                onTap: () => setState(() => _rating = i + 1),
                child: Icon(
                  i < _rating ? Icons.star : Icons.star_outline,
                  color: Colors.amber,
                  size: 36,
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _comment,
            maxLines: 3,
            decoration: const InputDecoration(
              labelText: 'Nhận xét (tuỳ chọn)',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: _busy
                ? null
                : () async {
                    setState(() => _busy = true);
                    final ok = await Get.find<ReviewController>().createReview(
                      orderId: widget.orderId,
                      rating: _rating,
                      comment: _comment.text.trim().isEmpty ? null : _comment.text.trim(),
                    );
                    if (!mounted) return;
                    setState(() => _busy = false);
                    if (!context.mounted) return;
                    if (ok) Navigator.pop(context, true);
                  },
            child: Text(_busy ? 'Đang gửi...' : 'Gửi đánh giá'),
          ),
        ],
      ),
    );
  }
}
