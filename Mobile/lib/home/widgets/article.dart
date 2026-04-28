import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';
import 'package:mobile_app_doan/utils/network_image_url.dart';
import 'package:openapi/openapi.dart';

enum ArticleMenuType { home, profile }

class Article extends StatelessWidget {
  final PostResponseDto postResponseDto;
  final bool isSaved;
  final VoidCallback onSave;
  final VoidCallback? onbid;
  final VoidCallback? onViewQuotes;
  final VoidCallback? onEdit;
  final VoidCallback? onDelete;
  final VoidCallback? onViewDetail;
  final VoidCallback? onReport;
  final ArticleMenuType menuType;

  const Article({
    super.key,
    required this.postResponseDto,
    required this.isSaved,
    required this.onSave,
    this.onbid,
    this.onViewQuotes,
    this.onEdit,
    this.onDelete,
    this.onViewDetail,
    this.onReport,
    this.menuType = ArticleMenuType.profile,
  });

  /// Parse desired time safely
  String _formatDesiredTime(dynamic desiredTime) {
    try {
      if (desiredTime == null) return 'Chưa xác định';

      DateTime parsedTime;
      if (desiredTime is String) {
        parsedTime = DateTime.parse(desiredTime);
      } else if (desiredTime is DateTime) {
        parsedTime = desiredTime;
      } else {
        return 'Chưa xác định';
      }

      return DateFormat('dd/MM/yyyy HH:mm', 'vi').format(parsedTime);
    } catch (e) {
      return 'Chưa xác định';
    }
  }

  /// Format currency safely
  String _formatBudget(dynamic budget) {
    try {
      if (budget == null) return '0';

      int amount = 0;
      if (budget is int) {
        amount = budget;
      } else if (budget is double) {
        amount = budget.toInt();
      } else if (budget is String) {
        amount = int.tryParse(budget) ?? 0;
      }

      return NumberFormat.decimalPattern('vi_VN').format(amount);
    } catch (e) {
      return '0';
    }
  }

  @override
  Widget build(BuildContext context) {
    // --- SAFE CUSTOMER INFO ---
    final customer = postResponseDto.customer;
    final fullName = customer.fullName ?? "Người dùng";
    final avatarUrl = customer.avatarUrl ?? "";
    final useNetworkAvatar = isHttpImageUrl(avatarUrl);

    // --- SAFE POST FIELDS ---
    final status = postResponseDto.status;
    final budget = _formatBudget(postResponseDto.budget);
    final desiredTime = _formatDesiredTime(postResponseDto.desiredTime);
    final location = postResponseDto.location ?? "";
    final title = postResponseDto.title;
    final description = postResponseDto.description;

    // --- SAFE IMAGES ---
    final images = postResponseDto.imageUrls?.toList() ?? [];
    final firstImage = images.isNotEmpty ? images.first : null;

    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final muted = scheme.onSurfaceVariant;

    return RepaintBoundary(
      child: Card(
        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        clipBehavior: Clip.antiAlias,
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  CircleAvatar(
                    radius: 20,
                    backgroundColor: scheme.surfaceContainerHighest,
                    backgroundImage:
                        useNetworkAvatar ? NetworkImage(avatarUrl) : null,
                    child: !useNetworkAvatar
                        ? Icon(Icons.person, color: muted)
                        : null,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          fullName,
                          style: theme.textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          status.toString(),
                          style: theme.textTheme.bodySmall?.copyWith(color: muted),
                        ),
                      ],
                    ),
                  ),
                  PopupMenuButton<String>(
                    onSelected: (value) async {
                      switch (value) {
                        case 'edit':
                          onEdit?.call();
                          break;
                        case 'delete':
                          onDelete?.call();
                          break;
                        case 'view':
                          onViewDetail?.call();
                          break;
                        case 'report':
                          onReport?.call();
                          break;
                        case 'quotes':
                          onViewQuotes?.call();
                          break;
                      }
                    },
                    itemBuilder: (ctx) {
                      final p = Theme.of(ctx).colorScheme.primary;
                      final e = Theme.of(ctx).colorScheme.error;
                      if (menuType == ArticleMenuType.home) {
                        return [
                          PopupMenuItem(
                            value: 'view',
                            child: Row(
                              children: [
                                Icon(LucideIcons.eye, size: 16, color: p),
                                const SizedBox(width: 8),
                                const Text('Xem chi tiết'),
                              ],
                            ),
                          ),
                          PopupMenuItem(
                            value: 'report',
                            child: Row(
                              children: [
                                Icon(LucideIcons.flag, size: 16, color: e),
                                const SizedBox(width: 8),
                                Text('Báo cáo', style: TextStyle(color: e)),
                              ],
                            ),
                          ),
                        ];
                      }
                      return [
                        if (onViewQuotes != null)
                          PopupMenuItem(
                            value: 'quotes',
                            child: Row(
                              children: [
                                Icon(LucideIcons.fileText, size: 16, color: p),
                                const SizedBox(width: 8),
                                const Text('Xem báo giá'),
                              ],
                            ),
                          ),
                        PopupMenuItem(
                          value: 'edit',
                          child: Row(
                            children: [
                              Icon(LucideIcons.edit2, size: 16, color: p),
                              const SizedBox(width: 8),
                              const Text('Chỉnh sửa'),
                            ],
                          ),
                        ),
                        PopupMenuItem(
                          value: 'delete',
                          child: Row(
                            children: [
                              Icon(LucideIcons.trash2, size: 16, color: e),
                              const SizedBox(width: 8),
                              Text('Xóa', style: TextStyle(color: e)),
                            ],
                          ),
                        ),
                      ];
                    },
                    icon: Icon(LucideIcons.moreVertical, size: 18, color: muted),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                title,
                style: theme.textTheme.titleMedium?.copyWith(fontSize: 15),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 6),
              if (description.isNotEmpty)
                Text(
                  description,
                  style: theme.textTheme.bodyMedium?.copyWith(fontSize: 13),
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
              const SizedBox(height: 10),
              if (firstImage != null)
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.network(
                    firstImage,
                    height: 160,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    filterQuality: FilterQuality.medium,
                    errorBuilder: (ctx, error, stackTrace) {
                      return Container(
                        height: 160,
                        color: scheme.surfaceContainerHighest,
                        child: Icon(LucideIcons.image, color: muted),
                      );
                    },
                  ),
                ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Icon(LucideIcons.mapPin, size: 14, color: scheme.primary),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      location,
                      style: theme.textTheme.bodySmall,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  Icon(LucideIcons.clock, size: 14, color: scheme.tertiary),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      desiredTime,
                      style: theme.textTheme.bodySmall,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Icon(LucideIcons.dollarSign, size: 14, color: scheme.secondary),
                  Expanded(
                    child: Text(
                      '$budget đ',
                      style: theme.textTheme.bodySmall?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              Divider(height: 18, color: scheme.outlineVariant.withValues(alpha: 0.5)),
              Row(
                children: [
                  if (onbid != null)
                    Expanded(
                      child: _actionButton(
                        context: context,
                        icon: LucideIcons.messageCircle,
                        label: 'Chào giá',
                        active: false,
                        onTap: onbid,
                      ),
                    ),
                  if (onViewQuotes != null)
                    Expanded(
                      child: _actionButton(
                        context: context,
                        icon: LucideIcons.fileText,
                        label: 'Báo giá',
                        active: false,
                        onTap: onViewQuotes,
                      ),
                    ),
                  Expanded(
                    child: _actionButton(
                      context: context,
                      icon: LucideIcons.bookmark,
                      label: 'Lưu',
                      active: isSaved,
                      onTap: onSave,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _actionButton({
    required BuildContext context,
    required IconData icon,
    required String label,
    required bool active,
    VoidCallback? onTap,
  }) {
    final scheme = Theme.of(context).colorScheme;
    final primary = scheme.primary;
    final muted = scheme.onSurfaceVariant;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        splashColor: primary.withValues(alpha: 0.12),
        highlightColor: primary.withValues(alpha: 0.06),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 18, color: active ? primary : muted),
              const SizedBox(width: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 13,
                  color: active ? primary : scheme.onSurface,
                  fontWeight: active ? FontWeight.w600 : FontWeight.normal,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
