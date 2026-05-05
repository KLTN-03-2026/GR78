import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile_app_doan/core/widgets/app_page_header.dart';

class HeaderApp extends StatelessWidget {
  final String title;
  final String searchHint;
  final VoidCallback? onMorePressed;
  final ValueChanged<String>? onSearch;

  const HeaderApp({
    super.key,
    required this.title,
    this.searchHint = 'Tìm kiếm...',
    this.onMorePressed,
    this.onSearch,
  });

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return AppPageHeader(
      title: title,
      trailing: [
        if (onMorePressed != null)
          IconButton(
            onPressed: onMorePressed,
            icon: const Icon(LucideIcons.moreVertical, color: Colors.white),
          ),
      ],
      bottom: TextField(
        onChanged: onSearch,
        decoration: InputDecoration(
          hintText: searchHint,
          filled: true,
          fillColor: scheme.surface,
          prefixIcon: Icon(Icons.search, color: scheme.onSurfaceVariant),
          contentPadding: const EdgeInsets.symmetric(vertical: 0),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(30),
            borderSide: BorderSide.none,
          ),
        ),
      ),
    );
  }
}
