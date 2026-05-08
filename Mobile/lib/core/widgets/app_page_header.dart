import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile_app_doan/core/theme/app_colors.dart';
import 'package:mobile_app_doan/core/theme/app_spacing.dart';

/// Compact gradient header dùng chung cho tabs và trang con.
///
/// Tự thêm nút back nếu route hiện tại có thể pop (trừ khi
/// truyền `showBackButton: false`).
class AppPageHeader extends StatelessWidget {
  const AppPageHeader({
    super.key,
    required this.title,
    this.subtitle,
    this.trailing,
    this.bottom,
    this.showBackButton,
    this.onBack,
  });

  final String title;
  final String? subtitle;
  final List<Widget>? trailing;
  final Widget? bottom;

  /// Nếu `null` sẽ tự suy luận theo `Navigator.canPop`.
  final bool? showBackButton;

  /// Override hành động back (mặc định gọi `Get.back()`).
  final VoidCallback? onBack;

  @override
  Widget build(BuildContext context) {
    final top = MediaQuery.paddingOf(context).top + AppSpacing.xs;
    final theme = Theme.of(context);
    final canPop = showBackButton ?? (ModalRoute.of(context)?.canPop ?? false);

    return Container(
      width: double.infinity,
      padding: EdgeInsets.fromLTRB(
        AppSpacing.xs,
        top,
        AppSpacing.xs,
        AppSpacing.sm,
      ),
      decoration: const BoxDecoration(
        gradient: AppColors.brandGradientHorizontal,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              if (canPop)
                IconButton(
                  tooltip: 'Quay lại',
                  onPressed: onBack ?? () => Get.back<void>(),
                  icon: const Icon(Icons.arrow_back, color: Colors.white),
                )
              else
                const SizedBox(width: AppSpacing.xs),
              Expanded(
                child: Padding(
                  padding: EdgeInsets.only(left: canPop ? 0 : AppSpacing.xs),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                          letterSpacing: -0.2,
                          height: 1.15,
                        ),
                      ),
                      if (subtitle != null && subtitle!.isNotEmpty) ...[
                        const SizedBox(height: 2),
                        Text(
                          subtitle!,
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: Colors.white.withValues(alpha: 0.9),
                            height: 1.3,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ],
                  ),
                ),
              ),
              if (trailing != null) ...trailing!,
            ],
          ),
          if (bottom != null) ...[
            const SizedBox(height: AppSpacing.xs),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xs),
              child: bottom!,
            ),
          ],
        ],
      ),
    );
  }
}
