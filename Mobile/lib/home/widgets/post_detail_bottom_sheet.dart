import 'package:flutter/material.dart';
import 'package:mobile_app_doan/core/theme/app_radii.dart';
import 'package:mobile_app_doan/core/theme/app_spacing.dart';
import 'package:openapi/openapi.dart';

/// Bottom sheet chi tiết bài đăng (dùng chung Trang chủ, Bài đã lưu, …).
Future<void> showPostDetailBottomSheet(
  BuildContext context,
  PostResponseDto post,
) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    useSafeArea: true,
    builder: (sheetContext) {
      final images = post.imageUrls?.toList() ?? [];
      final mainImage = images.isNotEmpty ? images.first : null;
      final desiredTime = post.desiredTime != null
          ? post.desiredTime!.toLocal().toString()
          : 'Chưa xác định';

      return Padding(
        padding: EdgeInsets.fromLTRB(
          AppSpacing.sm,
          AppSpacing.xs,
          AppSpacing.sm,
          AppSpacing.sm + MediaQuery.paddingOf(sheetContext).bottom,
        ),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      post.title,
                      style: Theme.of(sheetContext).textTheme.titleLarge,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.of(sheetContext).pop(),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.xs),
              if (mainImage != null)
                ClipRRect(
                  borderRadius: BorderRadius.circular(AppRadii.md),
                  child: Image.network(
                    mainImage,
                    height: 180,
                    width: double.infinity,
                    fit: BoxFit.cover,
                  ),
                ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                post.description,
                style: Theme.of(sheetContext).textTheme.bodyLarge,
              ),
              const SizedBox(height: AppSpacing.sm),
              _detailRow(
                sheetContext,
                'Địa điểm',
                post.location ?? 'Chưa xác định',
              ),
              _detailRow(sheetContext, 'Thời gian mong muốn', desiredTime),
              _detailRow(
                sheetContext,
                'Ngân sách',
                post.budget != null ? '${post.budget} đ' : 'Chưa cung cấp',
              ),
            ],
          ),
        ),
      );
    },
  );
}

Widget _detailRow(BuildContext context, String label, String value) {
  final theme = Theme.of(context);
  return Padding(
    padding: const EdgeInsets.only(bottom: AppSpacing.xs),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '$label: ',
          style: theme.textTheme.labelLarge?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    ),
  );
}
