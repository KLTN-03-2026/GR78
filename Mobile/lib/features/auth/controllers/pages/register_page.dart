import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile_app_doan/core/theme/app_colors.dart';
import 'package:mobile_app_doan/core/theme/app_radii.dart';
import 'package:mobile_app_doan/core/theme/app_spacing.dart';
import 'package:mobile_app_doan/core/widgets/app_auth_shell.dart';
import 'package:mobile_app_doan/features/auth/controllers/auth_controller.dart';
import 'package:mobile_app_doan/features/auth/utils/validator.dart';
import 'package:mobile_app_doan/features/auth/widgets/button.dart';
import 'package:mobile_app_doan/features/auth/widgets/field_input.dart';
import 'package:mobile_app_doan/features/auth/widgets/field_pass.dart';
import 'package:openapi/openapi.dart';

class RegisterPage extends StatefulWidget {
  final VoidCallback onLogin;
  final VoidCallback? onBack;

  const RegisterPage({required this.onLogin, this.onBack, super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  String userType = 'customer';

  final TextEditingController nameController = TextEditingController();
  final TextEditingController phoneController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController confirmPasswordController = TextEditingController();
  final AuthController authController = Get.find<AuthController>();

  String? nameError;
  String? phoneError;
  String? emailError;
  String? passwordError;
  String? confirmPasswordError;

  @override
  void dispose() {
    nameController.dispose();
    phoneController.dispose();
    emailController.dispose();
    passwordController.dispose();
    confirmPasswordController.dispose();
    super.dispose();
  }

  void handleRegister() {
    String? passwordValidation;
    setState(() {
      nameError = Validators.validateFullName(nameController.text);
      phoneError = Validators.validatePhone(phoneController.text);
      emailError = Validators.validateEmail(emailController.text);
      passwordValidation = Validators.validatePassword(
        passwordController.text,
        confirmPasswordController.text,
      );
      passwordError = passwordValidation;
      confirmPasswordError = passwordValidation;
    });

    if (nameError != null ||
        phoneError != null ||
        emailError != null ||
        passwordValidation != null) {
      return;
    }

    final UserRole role = userType == 'worker' ? UserRole.provider : UserRole.customer;
    authController.register(
      nameController.text.trim(),
      phoneController.text.replaceAll(' ', ''),
      emailController.text.trim(),
      passwordController.text.trim(),
      role,
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final canPop = widget.onBack != null || (ModalRoute.of(context)?.canPop ?? false);

    return AppAuthShell(
      title: 'Đăng ký',
      subtitle: 'Tạo tài khoản mới',
      leading: canPop
          ? IconButton(
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(),
              onPressed: widget.onBack ?? () => Get.back<void>(),
              icon: const Icon(Icons.arrow_back, color: Colors.white, size: 28),
            )
          : const SizedBox(height: 40),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('Bạn là', style: theme.textTheme.titleSmall),
          const SizedBox(height: AppSpacing.xs),
          Row(
            children: [
              Expanded(
                child: _buildUserTypeCard(
                  emoji: '👤',
                  title: 'Khách hàng',
                  subtitle: 'Tìm thợ',
                  selected: userType == 'customer',
                  onTap: () => setState(() => userType = 'customer'),
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: _buildUserTypeCard(
                  emoji: '🔧',
                  title: 'Thợ',
                  subtitle: 'Nhận việc',
                  selected: userType == 'worker',
                  onTap: () => setState(() => userType = 'worker'),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          InputField(
            label: 'Họ và tên',
            icon: LucideIcons.user,
            controller: nameController,
            hint: 'Nguyễn Văn A',
            errorText: nameError,
            onChanged: (value) {
              if (nameError != null) {
                setState(() => nameError = Validators.validateFullName(value));
              }
            },
          ),
          InputField(
            label: 'Số điện thoại',
            icon: LucideIcons.phone,
            controller: phoneController,
            hint: '0912 345 678',
            errorText: phoneError,
            onChanged: (value) {
              if (phoneError != null) {
                setState(() => phoneError = Validators.validatePhone(value));
              }
            },
          ),
          InputField(
            label: 'Email',
            icon: LucideIcons.mail,
            controller: emailController,
            hint: 'example@email.com',
            errorText: emailError,
            onChanged: (value) {
              if (emailError != null) {
                setState(() => emailError = Validators.validateEmail(value));
              }
            },
          ),
          PasswordField(
            label: 'Mật khẩu',
            controller: passwordController,
            errorText: passwordError,
            onChanged: (value) {
              if (passwordError != null) {
                setState(() {
                  passwordError = Validators.validatePassword(
                    value,
                    confirmPasswordController.text,
                  );
                });
              }
            },
          ),
          PasswordField(
            label: 'Xác nhận mật khẩu',
            controller: confirmPasswordController,
            errorText: confirmPasswordError,
            onChanged: (value) {
              setState(() {
                final msg = Validators.validatePassword(
                  passwordController.text,
                  value,
                );
                passwordError = msg;
                confirmPasswordError = msg;
              });
            },
          ),
          const SizedBox(height: AppSpacing.sm),
          Obx(() {
            if (authController.isLoading.value) {
              return const Padding(
                padding: EdgeInsets.symmetric(vertical: AppSpacing.sm),
                child: Center(child: CircularProgressIndicator()),
              );
            }
            return PrimaryButton(text: 'Đăng ký', onPressed: handleRegister);
          }),
          const SizedBox(height: AppSpacing.sm),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('Đã có tài khoản? ', style: theme.textTheme.bodyMedium),
              TextButton(onPressed: widget.onLogin, child: const Text('Đăng nhập')),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildUserTypeCard({
    required String emoji,
    required String title,
    required String subtitle,
    required bool selected,
    required VoidCallback onTap,
  }) {
    return Material(
      color: selected ? AppColors.brandTint : Colors.transparent,
      borderRadius: BorderRadius.circular(AppRadii.lg),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadii.lg),
        child: Container(
          padding: const EdgeInsets.all(AppSpacing.sm),
          decoration: BoxDecoration(
            border: Border.all(
              color: selected ? AppColors.seed : Colors.grey.shade300,
              width: 2,
            ),
            borderRadius: BorderRadius.circular(AppRadii.lg),
          ),
          child: Column(
            children: [
              Text(emoji, style: const TextStyle(fontSize: 28)),
              const SizedBox(height: 6),
              Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
              Text(subtitle, style: const TextStyle(fontSize: 12, color: Colors.grey)),
              if (selected) const Icon(Icons.check_circle, color: AppColors.seed),
            ],
          ),
        ),
      ),
    );
  }
}
