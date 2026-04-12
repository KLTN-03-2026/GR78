import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';

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
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 48, 16, 16),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.teal, Colors.tealAccent],
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        ),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              IconButton(
                onPressed: onMorePressed,
                icon: const Icon(LucideIcons.moreVertical, color: Colors.white),
              ),
            ],
          ),
          const SizedBox(height: 8),
          TextField(
            onChanged: onSearch,
            decoration: InputDecoration(
              hintText: searchHint,
              filled: true,
              fillColor: Colors.white,
              prefixIcon: const Icon(Icons.search, color: Colors.grey),
              contentPadding: const EdgeInsets.symmetric(vertical: 0),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(30),
                borderSide: BorderSide.none,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
