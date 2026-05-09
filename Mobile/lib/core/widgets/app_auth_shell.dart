import 'package:flutter/material.dart';
import 'package:mobile_app_doan/core/theme/app_radii.dart';
import 'package:mobile_app_doan/core/theme/app_spacing.dart';
import 'package:mobile_app_doan/core/widgets/app_brand_header.dart';

/// Auth layout: brand gradient header + white rounded content sheet.
class AppAuthShell extends StatelessWidget {
  const AppAuthShell({
    super.key,
    required this.title,
    required this.child,
    this.subtitle,
    this.leading,
  });

  final String title;
  final String? subtitle;
  final Widget? leading;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Scaffold(
      backgroundColor: scheme.surface,
      body: Column(
        children: [
          AppBrandHeader(
            title: title,
            subtitle: subtitle,
            leading: leading,
          ),
          Expanded(
            child: Material(
              color: scheme.surface,
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(AppRadii.sheetTop),
              ),
              clipBehavior: Clip.antiAlias,
              elevation: 1,
              shadowColor: Colors.black26,
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.sm,
                  AppSpacing.md,
                  AppSpacing.sm,
                  AppSpacing.lg,
                ),
                child: child,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
