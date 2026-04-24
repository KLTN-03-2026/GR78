import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile_app_doan/core/theme/app_colors.dart';
import 'package:mobile_app_doan/core/theme/app_spacing.dart';
import 'package:mobile_app_doan/core/widgets/app_auth_shell.dart';
import 'package:mobile_app_doan/features/auth/controllers/auth_controller.dart';
import 'package:mobile_app_doan/features/auth/utils/validator.dart';
import 'package:mobile_app_doan/features/auth/widgets/button.dart';
import 'package:mobile_app_doan/features/auth/widgets/field_input.dart';
import 'package:mobile_app_doan/features/auth/widgets/field_pass.dart';
import 'package:mobile_app_doan/features/auth/widgets/socail_button.dart';

class LoginPage extends StatefulWidget {
  final VoidCallback? onBack;
  final VoidCallback? onRegister;

  const LoginPage({super.key, this.onBack, this.onRegister});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  String loginMethod = 'phone';

  final AuthController authController = Get.find<AuthController>();

  final TextEditingController phoneController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();

  String? phoneError;
  String? emailError;
  String? passwordError;

  void handlerLogin() {
    setState(() {
      phoneError = Validators.validatePhone(phoneController.text.trim());
      emailError = Validators.validateEmail(emailController.text.trim());
      passwordError = Validators.validatePassword(
        passwordController.text.trim(),
        passwordController.text.trim(),
      );
    });

    if (loginMethod == 'phone') {
      authController.loginMobile(
        phoneController.text.trim(),
        passwordController.text.trim(),
      );
    } else {
      authController.loginMobile(
        emailController.text.trim(),
        passwordController.text.trim(),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final canPop = widget.onBack != null || (ModalRoute.of(context)?.canPop ?? false);

    return AppAuthShell(
      title: 'Đăng nhập',
      subtitle: 'Chào mừng bạn quay trở lại!',
      leading: canPop
          ? IconButton(
              onPressed: widget.onBack ?? () => Get.back<void>(),
              icon: const Icon(Icons.arrow_back, color: Colors.white, size: 28),
            )
          : const SizedBox(height: 40),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _buildLoginMethodToggle(theme),
          const SizedBox(height: AppSpacing.sm),
          if (loginMethod == 'phone')
            InputField(
              label: 'Số điện thoại',
              hint: '0912 345 678',
              icon: Icons.phone,
              controller: phoneController,
              errorText: phoneError,
              keyboardType: TextInputType.phone,
              onChanged: (value) {
                setState(() {
                  phoneError = Validators.validatePhone(value.trim());
                });
              },
            )
          else
            InputField(
              label: 'Email',
              hint: 'example@email.com',
              icon: Icons.email,
              controller: emailController,
              keyboardType: TextInputType.emailAddress,
              errorText: emailError,
              onChanged: (value) => setState(() {
                emailError = Validators.validateEmail(value.trim());
              }),
            ),
          PasswordField(
            label: 'Mật khẩu',
            controller: passwordController,
            errorText: passwordError,
            onChanged: (value) => setState(() {
              passwordError = Validators.validatePassword(
                value.trim(),
                value.trim(),
              );
            }),
          ),
          Align(
            alignment: Alignment.centerRight,
            child: TextButton(
              onPressed: () => Get.toNamed<void>('/forgot-password'),
              child: const Text('Quên mật khẩu?'),
            ),
          ),
          Obx(() {
            if (authController.isLoading.value) {
              return const Padding(
                padding: EdgeInsets.symmetric(vertical: AppSpacing.sm),
                child: Center(child: CircularProgressIndicator()),
              );
            }
            return PrimaryButton(text: 'Đăng nhập', onPressed: handlerLogin);
          }),
          const SizedBox(height: AppSpacing.md),
          Row(
            children: [
              Expanded(child: Divider(color: theme.dividerColor)),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xs),
                child: Text(
                  'Hoặc đăng nhập với',
                  style: theme.textTheme.bodySmall,
                ),
              ),
              Expanded(child: Divider(color: theme.dividerColor)),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Row(
            children: [
              SocialButton(
                label: 'Facebook',
                imagePath: 'assets/icons/facebook.png',
                onPressed: () {},
              ),
              const SizedBox(width: AppSpacing.sm),
              SocialButton(
                label: 'Google',
                imagePath: 'assets/icons/google.png',
                onPressed: () {},
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('Chưa có tài khoản?', style: theme.textTheme.bodyMedium),
              TextButton(
                onPressed: widget.onRegister ?? () => Get.toNamed<void>('/register'),
                child: const Text('Đăng ký ngay'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLoginMethodToggle(ThemeData theme) {
    return SegmentedButton<String>(
      segments: const [
        ButtonSegment(value: 'phone', label: Text('Số điện thoại')),
        ButtonSegment(value: 'email', label: Text('Email')),
      ],
      selected: {loginMethod},
      onSelectionChanged: (s) => setState(() => loginMethod = s.first),
      style: ButtonStyle(
        visualDensity: VisualDensity.compact,
        foregroundColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return AppColors.seed;
          }
          return theme.colorScheme.onSurfaceVariant;
        }),
      ),
    );
  }
}
