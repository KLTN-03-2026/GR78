import 'package:flutter/material.dart';
import 'package:mobile_app_doan/core/theme/app_colors.dart';
import 'package:mobile_app_doan/core/theme/app_spacing.dart';

/// Compact gradient header for in-app tabs (messages, notifications, search…).
class AppPageHeader extends StatelessWidget {
  const AppPageHeader({
    super.key,
    required this.title,
    this.trailing,
    this.bottom,
  });

  final String title;
  final List<Widget>? trailing;
  final Widget? bottom;

  @override
  Widget build(BuildContext context) {
    final top = MediaQuery.paddingOf(context).top + AppSpacing.sm;
    return Container(
      width: double.infinity,
      padding: EdgeInsets.fromLTRB(
        AppSpacing.sm,
        top,
        AppSpacing.sm,
        AppSpacing.sm,
      ),
      decoration: const BoxDecoration(gradient: AppColors.brandGradientHorizontal),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
              if (trailing != null) ...trailing!,
            ],
          ),
          if (bottom != null) ...[
            const SizedBox(height: AppSpacing.xs),
            bottom!,
          ],
        ],
      ),
    );
  }
}
