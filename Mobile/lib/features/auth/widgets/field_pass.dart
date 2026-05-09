import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile_app_doan/core/theme/app_radii.dart';
import 'package:mobile_app_doan/core/theme/app_spacing.dart';

class PasswordField extends StatefulWidget {
  final String label;
  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;
  final String? errorText;

  const PasswordField({
    super.key,
    required this.label,
    this.controller,
    this.onChanged,
    this.errorText,
  });

  @override
  State<PasswordField> createState() => _PasswordFieldState();
}

class _PasswordFieldState extends State<PasswordField> {
  bool _obscureText = true;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final hasError = widget.errorText != null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          widget.label,
          style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: AppSpacing.xxs),
        TextField(
          controller: widget.controller,
          onChanged: widget.onChanged,
          obscureText: _obscureText,
          decoration: InputDecoration(
            prefixIcon: Icon(
              LucideIcons.lock,
              color: hasError ? scheme.error : scheme.onSurfaceVariant,
            ),
            suffixIcon: IconButton(
              icon: Icon(
                _obscureText ? LucideIcons.eyeOff : LucideIcons.eye,
                color: scheme.onSurfaceVariant,
              ),
              onPressed: () => setState(() => _obscureText = !_obscureText),
            ),
            hintText: '••••••••',
            errorText: widget.errorText,
            errorMaxLines: 2,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(AppRadii.lg)),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(AppRadii.lg),
              borderSide: BorderSide(
                color: hasError ? scheme.error.withValues(alpha: 0.5) : scheme.outlineVariant,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(AppRadii.lg),
              borderSide: BorderSide(
                color: hasError ? scheme.error : scheme.primary,
                width: 2,
              ),
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
      ],
    );
  }
}
