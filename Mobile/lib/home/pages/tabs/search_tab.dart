import 'dart:async';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile_app_doan/home/controllers/user_controller.dart';
import 'package:mobile_app_doan/home/repo/backend_rest_repository.dart';
import 'package:mobile_app_doan/home/widgets/header.dart';
import 'package:mobile_app_doan/utils/network_image_url.dart';

class SearchTab extends StatefulWidget {
  const SearchTab({super.key});

  @override
  State<SearchTab> createState() => _SearchTabState();
}

class _SearchTabState extends State<SearchTab> {
  String searchQuery = '';
  Timer? _debounce;

  /// `users` = GET /profile/search · `global` = GET /search
  String _searchMode = 'users';

  Map<String, dynamic>? _globalData;
  bool _globalLoading = false;
  String _globalError = '';

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

  Future<void> _runGlobalSearch(String q) async {
    setState(() {
      _globalLoading = true;
      _globalError = '';
    });
    try {
      final raw = await Get.find<BackendRestRepository>().globalSearch({
        'q': q,
        'limit': 8,
      });
      if (!mounted) return;
      if (raw is Map) {
        setState(() => _globalData = Map<String, dynamic>.from(raw));
      } else {
        setState(() => _globalData = null);
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _globalError = e.toString();
          _globalData = null;
        });
      }
    } finally {
      if (mounted) setState(() => _globalLoading = false);
    }
  }

  void _onSearchInput(String value) {
    setState(() => searchQuery = value);
    _debounce?.cancel();
    final trimmed = value.trim();
    final pc = Get.find<ProfileController>();
    if (trimmed.isEmpty) {
      pc.searchResults.value = null;
      setState(() {
        _globalData = null;
        _globalError = '';
      });
      return;
    }
    _debounce = Timer(const Duration(milliseconds: 450), () {
      if (_searchMode == 'users') {
        pc.searchProfiles(trimmed);
      } else {
        _runGlobalSearch(trimmed);
      }
    });
  }

  void _setMode(String mode) {
    if (_searchMode == mode) return;
    setState(() {
      _searchMode = mode;
      _globalData = null;
      _globalError = '';
    });
    Get.find<ProfileController>().searchResults.value = null;
    final t = searchQuery.trim();
    if (t.isNotEmpty) {
      if (mode == 'users') {
        Get.find<ProfileController>().searchProfiles(t);
      } else {
        _runGlobalSearch(t);
      }
    }
  }

  @override
  void dispose() {
    _debounce?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bool isEmpty = searchQuery.trim().isEmpty;
    final scheme = Theme.of(context).colorScheme;

    return Scaffold(
      backgroundColor: scheme.surfaceContainerLowest,
      body: Column(
        children: [
          HeaderApp(
            title: 'Tìm kiếm',
            searchHint:
                _searchMode == 'users' ? 'Tên hiển thị...' : 'Bài đăng, thợ...',
            onMorePressed: () {},
            onSearch: _onSearchInput,
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
            child: SegmentedButton<String>(
              segments: const [
                ButtonSegment(
                  value: 'users',
                  label: Text('Người dùng'),
                  icon: Icon(Icons.person_search, size: 18),
                ),
                ButtonSegment(
                  value: 'global',
                  label: Text('Bài & thợ'),
                  icon: Icon(Icons.travel_explore, size: 18),
                ),
              ],
              selected: {_searchMode},
              onSelectionChanged: (s) => _setMode(s.first),
            ),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                if (isEmpty) ...[
                  _buildTrending(context),
                  const SizedBox(height: 20),
                  _buildRecent(context),
                  const SizedBox(height: 20),
                  _buildCategories(context),
                ] else if (_searchMode == 'users') ...[
                  _buildUserSearchResults(context),
                ] else ...[
                  _buildGlobalSearchResults(context),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTrending(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(LucideIcons.trendingUp, color: scheme.primary),
            const SizedBox(width: 8),
            Text(
              'Tìm kiếm phổ biến',
              style: Theme.of(context).textTheme.titleSmall,
            ),
          ],
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: trendingSearches.map((item) {
            return ActionChip(
              label: Text('${item['icon']} ${item['text']}'),
              onPressed: () => _onSearchInput(item['text']! as String),
              backgroundColor: scheme.surfaceContainerHighest.withValues(alpha: 0.6),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildRecent(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Tìm kiếm gần đây',
          style: Theme.of(context).textTheme.titleSmall,
        ),
        const SizedBox(height: 8),
        ...recentSearches.map(
          (e) => ListTile(
            leading: Icon(LucideIcons.clock, color: scheme.onSurfaceVariant),
            title: Text(e),
            onTap: () => _onSearchInput(e),
          ),
        ),
      ],
    );
  }

  Widget _buildCategories(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Danh mục', style: Theme.of(context).textTheme.titleSmall),
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
                  color: scheme.surfaceContainerHighest.withValues(alpha: 0.5),
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

  Widget _buildUserSearchResults(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
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
            style: Theme.of(context).textTheme.bodyLarge,
          ),
        );
      }
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Kết quả cho “$searchQuery” (${res.count}/${res.total})',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 10),
          ...res.profiles.map(
            (p) => Card(
              margin: const EdgeInsets.symmetric(vertical: 8),
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: scheme.primaryContainer,
                  backgroundImage: isHttpImageUrl(p.avatarUrl)
                      ? NetworkImage(p.avatarUrl!)
                      : null,
                  child: !isHttpImageUrl(p.avatarUrl)
                      ? Icon(Icons.person, color: scheme.onPrimaryContainer)
                      : null,
                ),
                title: Text(p.displayName ?? 'Người dùng'),
                subtitle: Text(
                  '${p.role.name}${p.bio != null && p.bio!.isNotEmpty ? ' · ${p.bio}' : ''}',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                trailing: p.isVerified
                    ? Icon(Icons.verified, color: scheme.primary)
                    : null,
              ),
            ),
          ),
        ],
      );
    });
  }

  List<Map<String, dynamic>> _mapList(dynamic v) {
    if (v is! List) return [];
    return v.whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
  }

  Widget _buildGlobalSearchResults(BuildContext context) {
    if (_globalLoading) {
      return const Padding(
        padding: EdgeInsets.all(32),
        child: Center(child: CircularProgressIndicator()),
      );
    }
    if (_globalError.isNotEmpty) {
      return Padding(
        padding: const EdgeInsets.all(16),
        child: Text(_globalError),
      );
    }
    final g = _globalData;
    if (g == null) {
      return const Padding(
        padding: EdgeInsets.all(16),
        child: Text('Không có dữ liệu'),
      );
    }
    final posts = _mapList(g['posts']);
    final providers = _mapList(g['providers']);
    if (posts.isEmpty && providers.isEmpty) {
      return const Padding(
        padding: EdgeInsets.all(16),
        child: Text('Không tìm thấy bài đăng hay thợ'),
      );
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '“$searchQuery” — bài: ${g['totalPosts'] ?? posts.length}, thợ: ${g['totalProviders'] ?? providers.length}',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        if (posts.isNotEmpty) ...[
          const Text('Bài đăng', style: TextStyle(fontWeight: FontWeight.w600)),
          ...posts.map(
            (p) => Card(
              child: ListTile(
                title: Text(p['title']?.toString() ?? ''),
                subtitle: Text(p['location']?.toString() ?? ''),
              ),
            ),
          ),
        ],
        if (providers.isNotEmpty) ...[
          const SizedBox(height: 8),
          const Text('Thợ', style: TextStyle(fontWeight: FontWeight.w600)),
          ...providers.map(
            (p) => Card(
              child: ListTile(
                leading: const CircleAvatar(child: Icon(Icons.person)),
                title: Text(p['displayName']?.toString() ?? 'Thợ'),
                subtitle: Text(p['province']?.toString() ?? ''),
              ),
            ),
          ),
        ],
      ],
    );
  }
}
