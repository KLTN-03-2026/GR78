// File: edit_profile_dialog.dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile_app_doan/home/controllers/user_controller.dart';
import 'package:openapi/openapi.dart';
import 'package:intl/intl.dart';

class EditProfileDialog extends StatefulWidget {
  final ProfileResponseDto user;
  final VoidCallback? onUpdated; // callback khi cập nhật xong

  const EditProfileDialog({super.key, required this.user, this.onUpdated});

  @override
  State<EditProfileDialog> createState() => _EditProfileDialogState();
}

class _EditProfileDialogState extends State<EditProfileDialog> {
  late TextEditingController displayNameController;
  late TextEditingController fullNameController;
  late TextEditingController emailController;
  late TextEditingController phoneController;
  late TextEditingController addressController;
  late TextEditingController bioController;
  late TextEditingController avatarUrlController;
  late TextEditingController birthdayController;

  UpdateProfileDtoGenderEnum? selectedGender;
  DateTime? selectedBirthday;
  bool isSaving = false;

  final _formKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();

    displayNameController = TextEditingController(
      text: widget.user.displayName ?? '',
    );
    fullNameController = TextEditingController(text: widget.user.fullName ?? '');
    emailController = TextEditingController(text: widget.user.email ?? '');
    phoneController = TextEditingController(text: widget.user.phone ?? '');
    addressController = TextEditingController(text: widget.user.address ?? '');
    bioController = TextEditingController(text: widget.user.bio ?? '');
    avatarUrlController = TextEditingController(text: widget.user.avatarUrl ?? '');
    
    if (widget.user.gender != null) {
      try {
        selectedGender = UpdateProfileDtoGenderEnum.valueOf(widget.user.gender!.name);
      } catch (e) {
        selectedGender = null;
      }
    } else {
      selectedGender = null;
    }
    
    selectedBirthday = widget.user.birthday;
    birthdayController = TextEditingController(
      text: widget.user.birthday != null
          ? DateFormat('dd/MM/yyyy').format(widget.user.birthday!)
          : '',
    );
  }

  @override
  void dispose() {
    displayNameController.dispose();
    fullNameController.dispose();
    emailController.dispose();
    phoneController.dispose();
    addressController.dispose();
    bioController.dispose();
    avatarUrlController.dispose();
    birthdayController.dispose();
    super.dispose();
  }

  String? _validateFullName(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Vui lòng nhập họ và tên';
    }
    if (value.trim().length < 2) {
      return 'Họ và tên phải có ít nhất 2 ký tự';
    }
    return null;
  }

  String? _validateEmail(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Vui lòng nhập email';
    }
    final emailRegex = RegExp(r'^[^@]+@[^@]+\.[^@]+');
    if (!emailRegex.hasMatch(value.trim())) {
      return 'Email không hợp lệ';
    }
    return null;
  }

  String? _validatePhone(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Vui lòng nhập số điện thoại';
    }
    final phoneRegex = RegExp(r'^[0-9]{10,11}$');
    if (!phoneRegex.hasMatch(value.trim())) {
      return 'Số điện thoại phải có 10-11 chữ số';
    }
    return null;
  }

  String? _validateAddress(String? value) {
    // Address is optional
    return null;
  }

  String? _validateBio(String? value) {
    // Bio is optional
    if (value != null && value.length > 500) {
      return 'Tiểu sử không được quá 500 ký tự';
    }
    return null;
  }

  String? _validateAvatarUrl(String? value) {
    if (value != null && value.trim().isNotEmpty) {
      final urlRegex = RegExp(
        r'^https?:\/\/.+',
        caseSensitive: false,
      );
      if (!urlRegex.hasMatch(value.trim())) {
        return 'URL không hợp lệ (phải bắt đầu bằng http:// hoặc https://)';
      }
    }
    return null;
  }

  String? _validateBirthday(String? value) {
    // Birthday is optional
    return null;
  }

  Future<void> _selectBirthday() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: selectedBirthday ?? DateTime.now().subtract(const Duration(days: 365 * 18)),
      firstDate: DateTime(1900),
      lastDate: DateTime.now().subtract(const Duration(days: 365 * 13)), // Must be at least 13 years old
      locale: const Locale('vi', 'VN'),
      helpText: 'Chọn ngày sinh',
      cancelText: 'Hủy',
      confirmText: 'Chọn',
    );

    if (picked != null) {
      setState(() {
        selectedBirthday = picked;
        birthdayController.text = DateFormat('dd/MM/yyyy').format(picked);
      });
    }
  }

  Future<void> _saveProfile() async {
    if (!(_formKey.currentState?.validate() ?? false)) {
      return;
    }

    setState(() {
      isSaving = true;
    });

    try {
      final profileController = Get.find<ProfileController>();

      // Update contact info (email, phone)
      final contactDto = UpdateContactDto(
        (b) => b
          ..email = emailController.text.trim()
          ..phone = phoneController.text.trim(),
      );

      final contactSuccess = await profileController.updateProfile(contactDto);
      if (!contactSuccess) {
        throw Exception(profileController.errorMessage.value);
      }

      final newDisplay = displayNameController.text.trim();
      final oldDisplay = widget.user.displayName ?? '';
      if (newDisplay.isNotEmpty && newDisplay != oldDisplay) {
        final dnDto = ChangeDisplayNameDto(
          (b) => b..displayName = newDisplay,
        );
        final dnRes = await profileController.changeDisplayName(dnDto);
        if (dnRes == null) {
          throw Exception(profileController.errorMessage.value);
        }
      }

      // Profile (không gửi avatarUrl — dùng endpoint /profile/avatar)
      final profileDto = UpdateProfileDto(
        (b) => b
          ..fullName = fullNameController.text.trim().isNotEmpty
              ? fullNameController.text.trim()
              : null
          ..address = addressController.text.trim().isNotEmpty
              ? addressController.text.trim()
              : null
          ..bio = bioController.text.trim().isNotEmpty
              ? bioController.text.trim()
              : null
          ..birthday = selectedBirthday != null
              ? DateFormat('yyyy-MM-dd').format(selectedBirthday!)
              : null
          ..gender = selectedGender,
      );

      final profileSuccess = await profileController.updateMyProfile(profileDto);
      if (!profileSuccess) {
        throw Exception(profileController.errorMessage.value);
      }

      final avatar = avatarUrlController.text.trim();
      if (avatar.isNotEmpty) {
        final avDto = UpdateAvatarDto((b) => b..avatarUrl = avatar);
        final avOk = await profileController.updateAvatar(avDto);
        if (!avOk) {
          throw Exception(profileController.errorMessage.value);
        }
      }

      // Success
      if (mounted) {
        Get.back();
        Get.snackbar(
          'Thành công',
          'Cập nhật thông tin thành công',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.green,
          colorText: Colors.white,
          duration: const Duration(seconds: 2),
        );
        widget.onUpdated?.call();
      }
    } catch (e) {
      if (mounted) {
        Get.snackbar(
          'Lỗi',
          e.toString().replaceAll('Exception: ', ''),
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: Colors.red,
          colorText: Colors.white,
          duration: const Duration(seconds: 3),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          isSaving = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Container(
        constraints: const BoxConstraints(maxHeight: 600),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.teal,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(16),
                  topRight: Radius.circular(16),
                ),
              ),
              child: Row(
                children: [
                  const Icon(Icons.edit, color: Colors.white),
                  const SizedBox(width: 8),
                  const Expanded(
                    child: Text(
                      'Chỉnh sửa hồ sơ',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white),
                    onPressed: isSaving ? null : () => Navigator.of(context).pop(),
                  ),
                ],
              ),
            ),

            // Form content
            Flexible(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Form(
                  key: _formKey,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      TextFormField(
                        controller: displayNameController,
                        decoration: const InputDecoration(
                          labelText: 'Tên hiển thị (đổi tối đa 30 ngày/lần)',
                          prefixIcon: Icon(Icons.badge),
                          border: OutlineInputBorder(),
                        ),
                        textCapitalization: TextCapitalization.words,
                      ),
                      const SizedBox(height: 16),

                      // Full Name
                      TextFormField(
                        controller: fullNameController,
                        decoration: const InputDecoration(
                          labelText: 'Họ và tên *',
                          prefixIcon: Icon(Icons.person),
                          border: OutlineInputBorder(),
                        ),
                        validator: _validateFullName,
                        textCapitalization: TextCapitalization.words,
                      ),
                      const SizedBox(height: 16),

                      // Email
                      TextFormField(
                        controller: emailController,
                        decoration: const InputDecoration(
                          labelText: 'Email *',
                          prefixIcon: Icon(Icons.email),
                          border: OutlineInputBorder(),
                        ),
                        keyboardType: TextInputType.emailAddress,
                        validator: _validateEmail,
                      ),
                      const SizedBox(height: 16),

                      // Phone
                      TextFormField(
                        controller: phoneController,
                        decoration: const InputDecoration(
                          labelText: 'Số điện thoại *',
                          prefixIcon: Icon(Icons.phone),
                          border: OutlineInputBorder(),
                        ),
                        keyboardType: TextInputType.phone,
                        validator: _validatePhone,
                      ),
                      const SizedBox(height: 16),

                      // Address
                      TextFormField(
                        controller: addressController,
                        decoration: const InputDecoration(
                          labelText: 'Địa chỉ',
                          prefixIcon: Icon(Icons.location_on),
                          border: OutlineInputBorder(),
                        ),
                        validator: _validateAddress,
                        maxLines: 2,
                      ),
                      const SizedBox(height: 16),

                      // Bio
                      TextFormField(
                        controller: bioController,
                        decoration: const InputDecoration(
                          labelText: 'Tiểu sử',
                          prefixIcon: Icon(Icons.description),
                          border: OutlineInputBorder(),
                          helperText: 'Tối đa 500 ký tự',
                        ),
                        validator: _validateBio,
                        maxLines: 3,
                        maxLength: 500,
                      ),
                      const SizedBox(height: 16),

                      // Birthday
                      TextFormField(
                        controller: birthdayController,
                        decoration: const InputDecoration(
                          labelText: 'Ngày sinh',
                          prefixIcon: Icon(Icons.calendar_today),
                          border: OutlineInputBorder(),
                          helperText: 'Phải từ 13 tuổi trở lên',
                        ),
                        readOnly: true,
                        onTap: _selectBirthday,
                        validator: _validateBirthday,
                      ),
                      const SizedBox(height: 16),

                      // Gender
                      DropdownButtonFormField<UpdateProfileDtoGenderEnum>(
                        initialValue: selectedGender,
                        decoration: const InputDecoration(
                          labelText: 'Giới tính',
                          prefixIcon: Icon(Icons.wc),
                          border: OutlineInputBorder(),
                        ),
                        items: [
                          const DropdownMenuItem(
                            value: UpdateProfileDtoGenderEnum.male,
                            child: Text('Nam'),
                          ),
                          const DropdownMenuItem(
                            value: UpdateProfileDtoGenderEnum.female,
                            child: Text('Nữ'),
                          ),
                          const DropdownMenuItem(
                            value: UpdateProfileDtoGenderEnum.other,
                            child: Text('Khác'),
                          ),
                        ],
                        onChanged: (value) {
                          setState(() {
                            selectedGender = value;
                          });
                        },
                      ),
                      const SizedBox(height: 16),

                      // Avatar URL
                      TextFormField(
                        controller: avatarUrlController,
                        decoration: const InputDecoration(
                          labelText: 'URL Ảnh đại diện',
                          prefixIcon: Icon(Icons.image),
                          border: OutlineInputBorder(),
                          helperText: 'Nhập URL ảnh hợp lệ',
                        ),
                        keyboardType: TextInputType.url,
                        validator: _validateAvatarUrl,
                      ),
                      const SizedBox(height: 8),
                    ],
                  ),
                ),
              ),
            ),

            // Actions
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: const BorderRadius.only(
                  bottomLeft: Radius.circular(16),
                  bottomRight: Radius.circular(16),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed: isSaving
                        ? null
                        : () => Navigator.of(context).pop(),
                    child: const Text('Hủy'),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    onPressed: isSaving ? null : _saveProfile,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.teal,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 24,
                        vertical: 12,
                      ),
                    ),
                    child: isSaving
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          )
                        : const Text('Lưu'),
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
