import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile_app_doan/core/api_error_message.dart';
import 'package:mobile_app_doan/core/theme/app_spacing.dart';
import 'package:mobile_app_doan/core/widgets/app_error_state.dart';
import 'package:mobile_app_doan/core/widgets/app_page_header.dart';
import 'package:mobile_app_doan/home/controllers/user_controller.dart';
import 'package:mobile_app_doan/utils/network_image_url.dart';
import 'package:openapi/openapi.dart';

class PublicProfilePage extends StatefulWidget {
  const PublicProfilePage({super.key, required this.userId});

  final String userId;

  @override
  State<PublicProfilePage> createState() => _PublicProfilePageState();
}

class _PublicProfilePageState extends State<PublicProfilePage> {
  PublicProfileResponseDto? _profile;
  String _error = '';
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    final id = widget.userId.trim();
    if (id.isEmpty) {
      setState(() {
        _loading = false;
        _error = 'Thiếu mã người dùng';
      });
      return;
    }
    setState(() {
      _loading = true;
      _error = '';
    });
    try {
      final data =
          await Get.find<ProfileController>().repository.getPublicProfile(id);
      if (mounted) {
        setState(() {
          _profile = data;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = describeApiError(e);
          _loading = false;
        });
      }
    }
  }

  String _roleLabel(PublicProfileResponseDtoRoleEnum r) {
    switch (r) {
      case PublicProfileResponseDtoRoleEnum.provider:
        return 'Thợ';
      case PublicProfileResponseDtoRoleEnum.admin:
        return 'Quản trị';
      case PublicProfileResponseDtoRoleEnum.customer:
        return 'Khách hàng';
      default:
        return 'Người dùng';
    }
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;

    return Scaffold(
      backgroundColor: scheme.surfaceContainerLowest,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          AppPageHeader(
            title: 'Hồ sơ',
            subtitle: 'Thông tin công khai',
            trailing: [
              IconButton(
                tooltip: 'Làm mới',
                onPressed: _load,
                icon: const Icon(Icons.refresh, color: Colors.white),
              ),
            ],
          ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _error.isNotEmpty
                    ? AppErrorState(message: _error, onRetry: _load)
                    : _profile == null
                        ? AppErrorState(
                            message: 'Không có dữ liệu',
                            onRetry: _load,
                          )
                        : _buildBody(context, _profile!),
          ),
        ],
      ),
    );
  }

  Widget _buildBody(BuildContext context, PublicProfileResponseDto p) {
    final scheme = Theme.of(context).colorScheme;
    final name = p.displayName?.trim().isNotEmpty == true
        ? p.displayName!.trim()
        : 'Người dùng';
    final avatar = p.avatarUrl;
    final useNet = isHttpImageUrl(avatar);
    // Không dùng locale 'vi' ở đây — tránh bắt buộc gọi initializeDateFormatting.
    final since = DateFormat('MM/yyyy').format(p.memberSince.toLocal());

    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.sm),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const SizedBox(height: AppSpacing.sm),
          CircleAvatar(
            radius: 48,
            backgroundColor: scheme.primaryContainer,
            backgroundImage: useNet ? NetworkImage(avatar!) : null,
            child: !useNet
                ? Icon(LucideIcons.user, size: 48, color: scheme.onPrimaryContainer)
                : null,
          ),
          const SizedBox(height: AppSpacing.sm),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Flexible(
                child: Text(
                  name,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                  textAlign: TextAlign.center,
                ),
              ),
              if (p.isVerified) ...[
                const SizedBox(width: 6),
                Icon(Icons.verified, color: scheme.primary, size: 22),
              ],
            ],
          ),
          const SizedBox(height: AppSpacing.xs),
          Chip(
            label: Text(_roleLabel(p.role)),
            avatar: Icon(
              p.role == PublicProfileResponseDtoRoleEnum.provider
                  ? LucideIcons.hammer
                  : LucideIcons.user,
              size: 18,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.sm),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: Icon(LucideIcons.calendar, color: scheme.primary),
                    title: const Text('Tham gia'),
                    subtitle: Text(since),
                  ),
                  if (p.role == PublicProfileResponseDtoRoleEnum.provider) ...[
                    const Divider(height: 1),
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: Icon(LucideIcons.star, color: scheme.primary),
                      title: const Text('Đánh giá từ khách hàng'),
                      subtitle: const Text('Xem nhận xét và điểm trung bình'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () => Get.toNamed<void>(
                        '/provider-reviews/${widget.userId.trim()}',
                      ),
                    ),
                  ],
                  if (p.bio != null && p.bio!.trim().isNotEmpty) ...[
                    const Divider(),
                    Text(
                      'Giới thiệu',
                      style: Theme.of(context).textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      p.bio!.trim(),
                      style: Theme.of(context).textTheme.bodyLarge,
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
