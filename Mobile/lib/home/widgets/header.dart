import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile_app_doan/core/widgets/app_page_header.dart';
import 'package:mobile_app_doan/core/widgets/app_search_field.dart';

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
    return AppPageHeader(
      title: title,
      showBackButton: false,
      trailing: [
        if (onMorePressed != null)
          IconButton(
            onPressed: onMorePressed,
            icon: const Icon(LucideIcons.moreVertical, color: Colors.white),
          ),
      ],
      bottom: AppSearchField(
        hintText: searchHint,
        onChanged: onSearch,
        onSurface: true,
      ),
    );
  }
}
