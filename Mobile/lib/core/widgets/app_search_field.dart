import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile_app_doan/core/theme/app_spacing.dart';

/// Search field bo tròn pill — dùng chung cho mọi nơi cần ô tìm kiếm
/// (Home, Search, Header gradient…). Đảm bảo cùng kích thước & cảm giác bấm.
class AppSearchField extends StatelessWidget {
  const AppSearchField({
    super.key,
    this.controller,
    this.hintText = 'Tìm kiếm...',
    this.onChanged,
    this.onSubmitted,
    this.autofocus = false,
    this.onSurface = false,
  });

  final TextEditingController? controller;
  final String hintText;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final bool autofocus;

  /// `true` khi field đặt trên gradient header (nền tối/đậm).
  final bool onSurface;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final theme = Theme.of(context);
    final fillColor = onSurface
        ? scheme.surface
        : scheme.surfaceContainerHighest.withValues(alpha: 0.55);
    final iconColor = onSurface ? scheme.primary : scheme.onSurfaceVariant;

    return TextField(
      controller: controller,
      onChanged: onChanged,
      onSubmitted: onSubmitted,
      autofocus: autofocus,
      style: theme.textTheme.bodyMedium?.copyWith(color: scheme.onSurface),
      decoration: InputDecoration(
        prefixIcon: Icon(LucideIcons.search, size: 20, color: iconColor),
        hintText: hintText,
        hintStyle: theme.textTheme.bodyMedium?.copyWith(
          color: scheme.onSurfaceVariant.withValues(alpha: 0.75),
        ),
        filled: true,
        fillColor: fillColor,
        isDense: true,
        contentPadding: const EdgeInsets.symmetric(
          vertical: AppSpacing.xs + 4,
          horizontal: AppSpacing.xs,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(999),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(999),
          borderSide: onSurface
              ? BorderSide.none
              : BorderSide(
                  color: scheme.outlineVariant.withValues(alpha: 0.35),
                ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(999),
          borderSide: BorderSide(color: scheme.primary, width: 1.5),
        ),
      ),
    );
  }
}
