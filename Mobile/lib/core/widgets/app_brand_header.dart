import 'package:flutter/material.dart';
import 'package:mobile_app_doan/core/theme/app_colors.dart';
import 'package:mobile_app_doan/core/theme/app_spacing.dart';

/// Gradient hero strip used across auth and some feature headers.
class AppBrandHeader extends StatelessWidget {
  const AppBrandHeader({
    super.key,
    required this.title,
    this.subtitle,
    this.leading,
    this.bottomPadding = AppSpacing.md,
    this.topPadding,
  });

  final String title;
  final String? subtitle;
  final Widget? leading;
  final double bottomPadding;
  final double? topPadding;

  @override
  Widget build(BuildContext context) {
    final top = topPadding ?? MediaQuery.paddingOf(context).top + AppSpacing.sm;
    return Container(
      width: double.infinity,
      padding: EdgeInsets.fromLTRB(
        AppSpacing.sm,
        top,
        AppSpacing.sm,
        bottomPadding,
      ),
      decoration: const BoxDecoration(gradient: AppColors.brandGradientHorizontal),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (leading != null) leading! else const SizedBox(height: 40),
          const SizedBox(height: AppSpacing.xs),
          Text(
            title,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 28,
              fontWeight: FontWeight.bold,
            ),
          ),
          if (subtitle != null) ...[
            const SizedBox(height: 6),
            Text(
              subtitle!,
              style: const TextStyle(color: Colors.white70, fontSize: 16),
            ),
          ],
        ],
      ),
    );
  }
}
