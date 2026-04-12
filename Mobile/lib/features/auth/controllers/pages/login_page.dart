import 'package:flutter/material.dart';
import 'package:get/get.dart';
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
  bool showPassword = false;
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
    return Scaffold(
      body: Container(
        color: Colors.white,
        child: Column(
          children: [
            // Header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.only(
                top: 60,
                bottom: 30,
                left: 20,
                right: 20,
              ),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF14B8A6), Color(0xFF0D9488)],
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (widget.onBack != null ||
                      (ModalRoute.of(context)?.canPop ?? false)) ...[
                    IconButton(
                      onPressed: widget.onBack ??
                          () {
                            Get.back<void>();
                          },
                      icon: const Icon(
                        Icons.arrow_back,
                        color: Colors.white,
                        size: 28,
                      ),
                    ),
                  ] else
                    const SizedBox(height: 48),
                  const SizedBox(height: 10),
                  const Text(
                    'Đăng nhập',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Chào mừng bạn quay trở lại!',
                    style: TextStyle(color: Colors.white70, fontSize: 16),
                  ),
                ],
              ),
            ),

            // Nội dung chính
            Expanded(
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 24,
                ),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
                ),
                child: SingleChildScrollView(
                  child: Column(
                    children: [
                      _buildLoginMethodToggle(),
                      const SizedBox(height: 20),

                      // Form input
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
                              phoneError = Validators.validatePhone(
                                value.trim(),
                              );
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
                      const SizedBox(height: 16),
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
                          onPressed: () {},
                          child: const Text(
                            'Quên mật khẩu?',
                            style: TextStyle(
                              color: Colors.teal,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ),

                      // Nút đăng nhập
                      Obx(() {
                        return authController.isLoading.value
                            ? const CircularProgressIndicator()
                            : PrimaryButton(
                                text: 'Đăng nhập',
                                onPressed: handlerLogin,
                              );
                      }),

                      const SizedBox(height: 10),

                      const SizedBox(height: 20),

                      // Divider
                      Row(
                        children: const [
                          Expanded(child: Divider(color: Colors.grey)),
                          Padding(
                            padding: EdgeInsets.symmetric(horizontal: 8),
                            child: Text(
                              'Hoặc đăng nhập với',
                              style: TextStyle(color: Colors.grey),
                            ),
                          ),
                          Expanded(child: Divider(color: Colors.grey)),
                        ],
                      ),
                      const SizedBox(height: 20),

                      Row(
                        children: [
                          SocialButton(
                            label: "Facebook",
                            imagePath: 'assets/icons/facebook.png',
                            onPressed: () {},
                          ),
                          const SizedBox(width: 12),
                          SocialButton(
                            label: "Google",
                            imagePath: 'assets/icons/google.png',
                            onPressed: () {},
                          ),
                        ],
                      ),

                      const SizedBox(height: 20),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Text(
                            'Chưa có tài khoản?',
                            style: TextStyle(color: Colors.grey),
                          ),
                          TextButton(
                            onPressed: widget.onRegister ??
                                () => Get.toNamed<void>('/register'),
                            child: const Text(
                              'Đăng ký ngay',
                              style: TextStyle(color: Colors.teal),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // === các widget con ===
  Widget _buildLoginMethodToggle() {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          Expanded(
            child: GestureDetector(
              onTap: () => setState(() => loginMethod = 'phone'),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 14),
                decoration: BoxDecoration(
                  color: loginMethod == 'phone'
                      ? Colors.white
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: loginMethod == 'phone'
                      ? [BoxShadow(color: Colors.black12, blurRadius: 3)]
                      : [],
                ),
                alignment: Alignment.center,
                child: Text(
                  'Số điện thoại',
                  style: TextStyle(
                    fontWeight: FontWeight.w500,
                    color: loginMethod == 'phone'
                        ? Colors.teal
                        : Colors.grey[600],
                  ),
                ),
              ),
            ),
          ),
          Expanded(
            child: GestureDetector(
              onTap: () => setState(() => loginMethod = 'email'),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 14),
                decoration: BoxDecoration(
                  color: loginMethod == 'email'
                      ? Colors.white
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: loginMethod == 'email'
                      ? [BoxShadow(color: Colors.black12, blurRadius: 3)]
                      : [],
                ),
                alignment: Alignment.center,
                child: Text(
                  'Email',
                  style: TextStyle(
                    fontWeight: FontWeight.w500,
                    color: loginMethod == 'email'
                        ? Colors.teal
                        : Colors.grey[600],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
