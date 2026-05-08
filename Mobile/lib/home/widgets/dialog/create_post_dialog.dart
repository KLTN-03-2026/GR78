import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile_app_doan/core/theme/app_colors.dart';
import 'package:intl/intl.dart';
import 'package:mobile_app_doan/home/controllers/post_controller.dart';
import 'package:openapi/openapi.dart';
import 'package:built_collection/built_collection.dart';

class CreatePostDialog extends StatefulWidget {
  final Function(CreatePostDto) onSubmit;

  const CreatePostDialog({super.key, required this.onSubmit});

  @override
  State<CreatePostDialog> createState() => _CreatePostDialogState();

  // Static method để show dialog
  static Future<void> show(
    BuildContext context, {
    required Function(CreatePostDto) onSubmit,
  }) {
    return showDialog(
      context: context,
      builder: (context) => CreatePostDialog(onSubmit: onSubmit),
    );
  }
}

class _CreatePostDialogState extends State<CreatePostDialog> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _locationController = TextEditingController();
  final _budgetController = TextEditingController();

  final List<String> _imageUrls = [];
  DateTime? _desiredTime;

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _locationController.dispose();
    _budgetController.dispose();
    super.dispose();
  }

  void _addImageUrl() {
    showDialog(
      context: context,
      builder: (context) {
        String url = '';
        return AlertDialog(
          title: const Text('Thêm URL hình ảnh'),
          content: TextField(
            autofocus: true,
            decoration: const InputDecoration(
              hintText: 'Nhập URL...',
              border: OutlineInputBorder(),
            ),
            onChanged: (value) => url = value,
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Hủy'),
            ),
            TextButton(
              onPressed: () {
                if (url.isNotEmpty) {
                  setState(() => _imageUrls.add(url));
                  Navigator.pop(context);
                }
              },
              child: const Text('Thêm'),
            ),
          ],
        );
      },
    );
  }

  void _pickDateTime() async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );

    if (date != null && mounted) {
      final time = await showTimePicker(
        context: context,
        initialTime: TimeOfDay.now(),
      );

      if (time != null) {
        setState(() {
          _desiredTime = DateTime(
            date.year,
            date.month,
            date.day,
            time.hour,
            time.minute,
          );
        });
      }
    }
  }

  void _handleSubmit() async {
    if (_formKey.currentState!.validate()) {
      // Chuyển desiredTime sang UTC nếu có
      DateTime? desiredTimeUtc;
      if (_desiredTime != null) {
        desiredTimeUtc = _desiredTime!.toUtc();
      }

      final data = CreatePostDto(
        (b) => b
          ..title = _titleController.text.trim()
          ..description = _descriptionController.text
          ..imageUrls = ListBuilder(_imageUrls)
          ..location = _locationController.text.isNotEmpty
              ? _locationController.text
              : null
          ..desiredTime = desiredTimeUtc
          ..budget = _budgetController.text.isNotEmpty
              ? double.tryParse(_budgetController.text)
              : null,
      );

      final PostController postController = Get.find<PostController>();
      final succes = await postController.createPost(data);
      if (succes && mounted) {
        Navigator.pop(context);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final p = scheme.primary;
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 600, maxHeight: 700),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Container(
              decoration: const BoxDecoration(
                gradient: AppColors.brandGradientHorizontal,
                borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
              ),
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  const Expanded(
                    child: Text(
                      'Tạo Post Mới',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),

            // Form Content
            Expanded(
              child: Form(
                key: _formKey,
                child: ListView(
                  padding: const EdgeInsets.all(20),
                  children: [
                    // Title
                    TextFormField(
                      controller: _titleController,
                      decoration: InputDecoration(
                        labelText: 'Tiêu đề *',
                        hintText: 'Nhập tiêu đề bài đăng...',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                          borderSide: BorderSide(
                            color: p,
                            width: 2,
                          ),
                        ),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Vui lòng nhập tiêu đề';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // Description
                    TextFormField(
                      controller: _descriptionController,
                      maxLines: 4,
                      decoration: InputDecoration(
                        labelText: 'Mô tả chi tiết *',
                        hintText: 'Mô tả chi tiết về dịch vụ bạn cần...',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                          borderSide: BorderSide(
                            color: p,
                            width: 2,
                          ),
                        ),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Vui lòng nhập mô tả';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // Image URLs
                    Row(
                      children: [
                        Icon(
                          Icons.image,
                          color: p,
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'Hình ảnh (không bắt buộc)',
                          style: TextStyle(fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    InkWell(
                      onTap: _addImageUrl,
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: p.withValues(
                              alpha: 0.5,
                            ),
                            width: 2,
                            style: BorderStyle.solid,
                          ),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Center(
                          child: Text(
                            '+ Thêm URL hình ảnh',
                            style: TextStyle(color: p),
                          ),
                        ),
                      ),
                    ),
                    if (_imageUrls.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      ..._imageUrls.asMap().entries.map((entry) {
                        final index = entry.key;
                        final url = entry.value;
                        return Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: p.withValues(
                              alpha: 0.1,
                            ),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(4),
                                child: Image.network(
                                  url,
                                  width: 48,
                                  height: 48,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => Container(
                                    width: 48,
                                    height: 48,
                                    color: scheme.surfaceContainerHighest,
                                    child: const Icon(Icons.broken_image),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  url,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(fontSize: 12),
                                ),
                              ),
                              IconButton(
                                icon: const Icon(
                                  Icons.close,
                                  color: Colors.red,
                                  size: 20,
                                ),
                                onPressed: () {
                                  setState(() => _imageUrls.removeAt(index));
                                },
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ],
                    const SizedBox(height: 16),

                    // Location
                    Row(
                      children: [
                        Icon(
                          Icons.location_on,
                          color: p,
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'Địa điểm dịch vụ',
                          style: TextStyle(fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: _locationController,
                      decoration: InputDecoration(
                        hintText: 'Nhập địa điểm...',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                          borderSide: BorderSide(
                            color: p,
                            width: 2,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Desired Time
                    Row(
                      children: [
                        Icon(
                          Icons.calendar_today,
                          color: p,
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'Thời gian mong muốn',
                          style: TextStyle(fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    InkWell(
                      onTap: _pickDateTime,
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          border: Border.all(color: scheme.outlineVariant),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text(
                                _desiredTime != null
                                    ? DateFormat(
                                        'dd/MM/yyyy HH:mm',
                                      ).format(_desiredTime!)
                                    : 'Chọn ngày và giờ',
                                style: TextStyle(
                                  color: _desiredTime != null
                                      ? scheme.onSurface
                                      : scheme.onSurfaceVariant,
                                ),
                              ),
                            ),
                            Icon(
                              Icons.access_time,
                              color: p,
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Budget
                    Row(
                      children: [
                        Icon(
                          Icons.attach_money,
                          color: p,
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'Ngân sách (VNĐ)',
                          style: TextStyle(fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: _budgetController,
                      keyboardType: TextInputType.number,
                      decoration: InputDecoration(
                        hintText: 'Nhập ngân sách...',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                          borderSide: BorderSide(
                            color: p,
                            width: 2,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Action Buttons
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                border: Border(top: BorderSide(color: scheme.outlineVariant)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(context),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: const Text('Hủy'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: FilledButton(
                      onPressed: _handleSubmit,
                      style: FilledButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: const Text('Tạo Post'),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Data class để truyền dữ liệ

// Cách sử dụng:
// CreatePostDialog.show(
//   context,
//   onSubmit: (data) {
//     print('Post data: ${data.toCreatePostDto()}');
//     // Gọi API tạo post ở đây
//   },
// );
