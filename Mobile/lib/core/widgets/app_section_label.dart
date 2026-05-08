import 'package:flutter/material.dart';
import 'package:mobile_app_doan/core/theme/app_spacing.dart';

/// Label nhóm — dùng đầu mỗi block trong list / cài đặt để đỡ "lì" mắt.
class AppSectionLabel extends StatelessWidget {
  const AppSectionLabel(
    this.text, {
    super.key,
    this.trailing,
    this.padding = const EdgeInsets.fromLTRB(
      AppSpacing.xxs,
      AppSpacing.sm,
      AppSpacing.xxs,
      AppSpacing.xs,
    ),
  });

  final String text;
  final Widget? trailing;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: padding,
      child: Row(
        children: [
          Expanded(
            child: Text(
              text,
              style: theme.textTheme.labelLarge?.copyWith(
                color: theme.colorScheme.primary,
                letterSpacing: 0.3,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          if (trailing != null) trailing!,
        ],
      ),
    );
  }
}
