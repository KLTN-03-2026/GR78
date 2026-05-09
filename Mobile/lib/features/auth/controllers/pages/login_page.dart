import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile_app_doan/core/theme/app_spacing.dart';
import 'package:mobile_app_doan/core/widgets/app_auth_shell.dart';
import 'package:mobile_app_doan/features/auth/controllers/auth_controller.dart';
import 'package:mobile_app_doan/features/auth/utils/validator.dart';
import 'package:mobile_app_doan/features/auth/widgets/button.dart';
import 'package:mobile_app_doan/features/auth/widgets/field_input.dart';
import 'package:mobile_app_doan/features/auth/widgets/field_pass.dart';
import 'package:mobile_app_doan/features/auth/widgets/social_button.dart';

class LoginPage extends StatefulWidget {
  final VoidCallback? onBack;
  final VoidCallback? onRegister;

  const LoginPage({super.key, this.onBack, this.onRegister});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final AuthController authController = Get.find<AuthController>();

  final TextEditingController identifierController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();

  String? identifierError;
  String? passwordError;

  @override
  void dispose() {
    identifierController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  void handlerLogin() {
    setState(() {
      identifierError =
          Validators.validateLoginIdentifier(identifierController.text);
      passwordError = Validators.validatePassword(
        passwordController.text.trim(),
        passwordController.text.trim(),
      );
    });

    if (identifierError != null || passwordError != null) {
      return;
    }

    authController.loginMobile(
      identifierController.text.trim(),
      passwordController.text.trim(),
    );
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
          InputField(
            label: 'Email hoặc số điện thoại',
            hint: 'example@email.com hoặc 0912 345 678',
            icon: Icons.person_outline,
            controller: identifierController,
            errorText: identifierError,
            keyboardType: TextInputType.text,
            onChanged: (value) {
              setState(() {
                identifierError = Validators.validateLoginIdentifier(value);
              });
            },
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
          const AuthSocialLoginSection(isLoginFlow: true),
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
}
