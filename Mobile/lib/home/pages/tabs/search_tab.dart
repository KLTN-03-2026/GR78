import 'dart:async';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile_app_doan/home/controllers/user_controller.dart';
import 'package:mobile_app_doan/home/widgets/header.dart';

class SearchTab extends StatefulWidget {
  const SearchTab({super.key});

  @override
  State<SearchTab> createState() => _SearchTabState();
}

class _SearchTabState extends State<SearchTab> {
  String searchQuery = '';
  bool showFilters = false;
  Timer? _debounce;

  final List<Map<String, dynamic>> trendingSearches = [
    {'text': 'Thợ điện', 'icon': '⚡'},
    {'text': 'Sửa điều hòa', 'icon': '❄️'},
    {'text': 'Sơn nhà', 'icon': '🎨'},
    {'text': 'Thợ mộc', 'icon': '🔨'},
    {'text': 'Vệ sinh máy lạnh', 'icon': '🧹'},
  ];

  final List<String> recentSearches = [
    'Thợ sửa điện Hải Châu',
    'Sơn nhà giá rẻ',
    'Thợ mộc Đà Nẵng',
    'Vệ sinh máy lạnh',
  ];

  final categories = [
    {'name': 'Điện', 'icon': '⚡'},
    {'name': 'Sơn', 'icon': '🎨'},
    {'name': 'Mộc', 'icon': '🔨'},
    {'name': 'Điều hòa', 'icon': '❄️'},
    {'name': 'Vệ sinh', 'icon': '🧹'},
  ];

  void _onSearchInput(String value) {
    setState(() => searchQuery = value);
    _debounce?.cancel();
    final trimmed = value.trim();
    final pc = Get.find<ProfileController>();
    if (trimmed.isEmpty) {
      pc.searchResults.value = null;
      return;
    }
    _debounce = Timer(const Duration(milliseconds: 450), () {
      pc.searchProfiles(trimmed);
    });
  }

  @override
  void dispose() {
    _debounce?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bool isEmpty = searchQuery.trim().isEmpty;

    return Scaffold(
      body: Column(
        children: [
          HeaderApp(
            title: 'Tìm kiếm người dùng',
            searchHint: 'Tên hiển thị...',
            onMorePressed: () {},
            onSearch: _onSearchInput,
          ),

          // ===== BODY =====
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                if (isEmpty) ...[
                  _buildTrending(),
                  const SizedBox(height: 20),
                  _buildRecent(),
                  const SizedBox(height: 20),
                  _buildCategories(),
                ] else ...[
                  _buildSearchResults(),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTrending() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: const [
            Icon(LucideIcons.trendingUp, color: Colors.teal),
            SizedBox(width: 8),
            Text(
              "Tìm kiếm phổ biến",
              style: TextStyle(fontWeight: FontWeight.w600),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: trendingSearches.map((item) {
            return ActionChip(
              label: Text("${item['icon']} ${item['text']}"),
              onPressed: () => _onSearchInput(item['text']! as String),
              backgroundColor: Colors.grey[100],
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildRecent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Tìm kiếm gần đây",
          style: TextStyle(fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 8),
        ...recentSearches.map(
          (e) => ListTile(
            leading: const Icon(LucideIcons.clock, color: Colors.grey),
            title: Text(e),
            onTap: () => _onSearchInput(e),
          ),
        ),
      ],
    );
  }

  Widget _buildCategories() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("Danh mục", style: TextStyle(fontWeight: FontWeight.w600)),
        const SizedBox(height: 10),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 3,
            childAspectRatio: 1,
          ),
          itemCount: categories.length,
          itemBuilder: (context, i) {
            final cat = categories[i];
            return GestureDetector(
              onTap: () => _onSearchInput(cat['name']!),
              child: Container(
                margin: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(cat['icon']!, style: const TextStyle(fontSize: 24)),
                    const SizedBox(height: 4),
                    Text(
                      cat['name']!,
                      style: const TextStyle(fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildSearchResults() {
    final pc = Get.find<ProfileController>();
    return Obx(() {
      if (pc.searchLoading.value) {
        return const Padding(
          padding: EdgeInsets.all(32),
          child: Center(child: CircularProgressIndicator()),
        );
      }
      final res = pc.searchResults.value;
      if (res == null || res.profiles.isEmpty) {
        return Padding(
          padding: const EdgeInsets.all(16),
          child: Text(
            pc.errorMessage.value.isEmpty
                ? 'Không tìm thấy người dùng'
                : pc.errorMessage.value,
          ),
        );
      }
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Kết quả cho “$searchQuery” (${res.count}/${res.total})',
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 10),
          ...res.profiles.map(
            (p) => Card(
              margin: const EdgeInsets.symmetric(vertical: 8),
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: Colors.teal,
                  backgroundImage: p.avatarUrl != null && p.avatarUrl!.isNotEmpty
                      ? NetworkImage(p.avatarUrl!)
                      : null,
                  child: p.avatarUrl == null || p.avatarUrl!.isEmpty
                      ? const Icon(Icons.person, color: Colors.white)
                      : null,
                ),
                title: Text(p.displayName ?? 'Người dùng'),
                subtitle: Text(
                  '${p.role.name}${p.bio != null && p.bio!.isNotEmpty ? ' · ${p.bio}' : ''}',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                trailing: p.isVerified
                    ? const Icon(Icons.verified, color: Colors.teal)
                    : null,
              ),
            ),
          ),
        ],
      );
    });
  }
}
