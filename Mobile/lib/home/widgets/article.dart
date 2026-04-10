import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:intl/intl.dart';
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
    Key? key,
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
  }) : super(key: key);

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

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // --- Header ---
            Row(
              children: [
                CircleAvatar(
                  radius: 20,
                  backgroundColor: Colors.grey[200],
                  backgroundImage: avatarUrl.isNotEmpty
                      ? NetworkImage(avatarUrl)
                      : null,
                  child: avatarUrl.isEmpty
                      ? const Icon(Icons.person, color: Colors.grey)
                      : null,
                ),
                const SizedBox(width: 10),

                // USER NAME + STATUS
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        fullName,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        status.toString(),
                        style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                      ),
                    ],
                  ),
                ),

                // MENU 3 CHẤM
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
                  itemBuilder: (context) {
                    if (menuType == ArticleMenuType.home) {
                      return const [
                        PopupMenuItem(
                          value: 'view',
                          child: Row(
                            children: [
                              Icon(LucideIcons.eye, size: 16, color: Colors.teal),
                              SizedBox(width: 8),
                              Text('Xem chi tiết'),
                            ],
                          ),
                        ),
                        PopupMenuItem(
                          value: 'report',
                          child: Row(
                            children: [
                              Icon(LucideIcons.flag, size: 16, color: Colors.red),
                              SizedBox(width: 8),
                              Text('Báo cáo', style: TextStyle(color: Colors.red)),
                            ],
                          ),
                        ),
                      ];
                    }

                    return [
                      if (onViewQuotes != null)
                        const PopupMenuItem(
                          value: 'quotes',
                          child: Row(
                            children: [
                              Icon(LucideIcons.fileText,
                                  size: 16, color: Colors.teal),
                              SizedBox(width: 8),
                              Text('Xem báo giá'),
                            ],
                          ),
                        ),
                      const PopupMenuItem(
                        value: 'edit',
                        child: Row(
                          children: [
                            Icon(LucideIcons.edit2, size: 16, color: Colors.teal),
                            SizedBox(width: 8),
                            Text('Chỉnh sửa'),
                          ],
                        ),
                      ),
                      const PopupMenuItem(
                        value: 'delete',
                        child: Row(
                          children: [
                            Icon(LucideIcons.trash2, size: 16, color: Colors.red),
                            SizedBox(width: 8),
                            Text('Xóa', style: TextStyle(color: Colors.red)),
                          ],
                        ),
                      ),
                    ];
                  },
                  icon: const Icon(LucideIcons.moreVertical, size: 18),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ],
            ),

            const SizedBox(height: 8),

            // --- Title ---
            Text(
              title,
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),

            const SizedBox(height: 6),

            // --- Description ---
            if (description.isNotEmpty)
              Text(
                description,
                style: TextStyle(color: Colors.grey[700], fontSize: 13),
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),

            const SizedBox(height: 10),

            // --- IMAGE ---
            if (firstImage != null)
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.network(
                  firstImage,
                  height: 160,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      height: 160,
                      color: Colors.grey[200],
                      child: const Center(
                        child: Icon(LucideIcons.image, color: Colors.grey),
                      ),
                    );
                  },
                ),
              ),

            const SizedBox(height: 10),

            // --- LOCATION ---
            Row(
              children: [
                const Icon(LucideIcons.mapPin, size: 14, color: Colors.teal),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    location,
                    style: const TextStyle(fontSize: 12),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 4),

            // --- TIME + BUDGET ---
            Row(
              children: [
                const Icon(LucideIcons.clock, size: 14, color: Colors.orange),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    desiredTime,
                    style: const TextStyle(fontSize: 12),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 8),
                const Icon(
                  LucideIcons.dollarSign,
                  size: 14,
                  color: Colors.green,
                ),
                Expanded(
                  child: Text(
                    "$budget đ",
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),

            const Divider(height: 18),

            // --- ACTION BUTTONS ---
            Row(
              children: [
                if (onbid != null)
                  Expanded(
                    child: _actionButton(
                      icon: LucideIcons.messageCircle,
                      label: "Chào giá",
                      active: false,
                      onTap: onbid,
                    ),
                  ),
                if (onViewQuotes != null)
                  Expanded(
                    child: _actionButton(
                      icon: LucideIcons.fileText,
                      label: "Báo giá",
                      active: false,
                      onTap: onViewQuotes,
                    ),
                  ),
                Expanded(
                  child: _actionButton(
                    icon: LucideIcons.bookmark,
                    label: "Lưu",
                    active: isSaved,
                    onTap: onSave,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _actionButton({
    required IconData icon,
    required String label,
    required bool active,
    VoidCallback? onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 18,
              color: active ? Colors.teal : Colors.grey[600],
            ),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                color: active ? Colors.teal : Colors.grey[700],
                fontWeight: active ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
