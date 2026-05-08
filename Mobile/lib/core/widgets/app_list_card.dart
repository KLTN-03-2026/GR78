import 'package:flutter/material.dart';
import 'package:mobile_app_doan/core/theme/app_spacing.dart';

/// Card chuẩn cho list (đơn hàng, báo giá, chứng chỉ…) — header + body + footer
/// có cùng padding/spacing/border. Tránh việc mỗi page tự build Card khác kiểu.
class AppListCard extends StatelessWidget {
  const AppListCard({
    super.key,
    required this.title,
    this.subtitle,
    this.leading,
    this.trailing,
    this.body,
    this.footer,
    this.onTap,
    this.padding = const EdgeInsets.all(AppSpacing.sm),
  });

  final String title;
  final String? subtitle;

  /// Avatar / icon ở đầu card.
  final Widget? leading;

  /// Trạng thái / popup menu ở góc phải.
  final Widget? trailing;

  /// Phần thân tuỳ biến (ảnh, mô tả dài…).
  final Widget? body;

  /// Hàng nút bấm dưới cùng.
  final Widget? footer;

  final VoidCallback? onTap;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;

    final content = Padding(
      padding: padding,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (leading != null) ...[
                leading!,
                const SizedBox(width: AppSpacing.xs + 4),
              ],
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: theme.textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w700,
                        height: 1.2,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (subtitle != null && subtitle!.isNotEmpty) ...[
                      const SizedBox(height: 2),
                      Text(
                        subtitle!,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: scheme.onSurfaceVariant,
                          height: 1.3,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ],
                ),
              ),
              if (trailing != null) ...[
                const SizedBox(width: AppSpacing.xs),
                trailing!,
              ],
            ],
          ),
          if (body != null) ...[
            const SizedBox(height: AppSpacing.xs + 2),
            body!,
          ],
          if (footer != null) ...[
            const SizedBox(height: AppSpacing.xs + 2),
            Divider(
              height: 1,
              thickness: 1,
              color: scheme.outlineVariant.withValues(alpha: 0.5),
            ),
            const SizedBox(height: AppSpacing.xs),
            footer!,
          ],
        ],
      ),
    );

    return Card(
      margin: EdgeInsets.zero,
      clipBehavior: Clip.antiAlias,
      child: onTap == null
          ? content
          : InkWell(onTap: onTap, child: content),
    );
  }
}
