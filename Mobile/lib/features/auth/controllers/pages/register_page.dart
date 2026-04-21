import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lucide_icons/lucide_icons.dart';
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
  bool showPassword = false;
  String userType = 'customer';
  bool isLoading = false;

  final TextEditingController nameController = TextEditingController();
  final TextEditingController phoneController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController confirmPasswordController =
      TextEditingController();
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

  // validation fullForm

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

    final UserRole role =
        userType == 'worker' ? UserRole.provider : UserRole.customer;
    authController.register(
      nameController.text.trim(),
      phoneController.text.replaceAll(' ', ''),
      emailController.text.trim(),
      passwordController.text.trim(),
      role,
    );
    // log infor user
    print('Registering user:');
    print('Name: ${nameController.text.trim()}');
    print('Phone: ${phoneController.text.replaceAll(' ', '')}');
    print('Email: ${emailController.text.trim()}');
    print('User Type: ');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
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
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                    onPressed: widget.onBack ?? () => Get.back<void>(),
                    icon: const Icon(
                      Icons.arrow_back,
                      color: Colors.white,
                      size: 28,
                    ),
                  ),
                ] else
                  const SizedBox(height: 8),
                const Text(
                  "Đăng ký",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  "Tạo tài khoản mới",
                  style: TextStyle(color: Colors.white70, fontSize: 16),
                ),
              ],
            ),
          ),

          // Nội dung chính
          Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
              ),
              child: SingleChildScrollView(
                child: Column(
                  children: [
                    // Chọn loại người dùng
                    const Align(
                      alignment: Alignment.centerLeft,
                      child: Text(
                        "Bạn là",
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: _buildUserTypeCard(
                            emoji: "👤",
                            title: "Khách hàng",
                            subtitle: "Tìm thợ",
                            selected: userType == 'customer',
                            onTap: () => setState(() => userType = 'customer'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _buildUserTypeCard(
                            emoji: "🔧",
                            title: "Thợ",
                            subtitle: "Nhận việc",
                            selected: userType == 'worker',
                            onTap: () => setState(() => userType = 'worker'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Form đăng ký với validation
                    InputField(
                      label: "Họ và tên",
                      icon: LucideIcons.user,
                      controller: nameController,
                      hint: "Nguyễn Văn A",
                      errorText: nameError,
                      onChanged: (value) {
                        if (nameError != null) {
                          setState(() {
                            nameError = Validators.validateFullName(value);
                          });
                        }
                      },
                    ),
                    InputField(
                      label: "Số điện thoại",
                      icon: LucideIcons.phone,
                      controller: phoneController,
                      hint: "0912 345 678",
                      errorText: phoneError,
                      onChanged: (value) {
                        if (phoneError != null) {
                          setState(() {
                            phoneError = Validators.validatePhone(value);
                          });
                        }
                      },
                    ),
                    InputField(
                      label: "Email",
                      icon: LucideIcons.mail,
                      controller: emailController,
                      hint: "example@email.com",
                      errorText: emailError,
                      onChanged: (value) {
                        if (emailError != null) {
                          setState(() {
                            emailError = Validators.validateEmail(value);
                          });
                        }
                      },
                    ),
                    PasswordField(
                      label: "Mật khẩu",
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
                      label: "Xác nhận mật khẩu",
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

                    const SizedBox(height: 20),

                    // Nút đăng ký
                    Obx(() {
                      return authController.isLoading.value
                          ? const CircularProgressIndicator()
                          : PrimaryButton(
                              text: "Đăng ký",
                              onPressed: handleRegister,
                            );
                    }),
                    const SizedBox(height: 16),

                    // Chuyển sang đăng nhập
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text("Đã có tài khoản? "),
                        GestureDetector(
                          onTap: widget.onLogin,
                          child: const Text(
                            "Đăng nhập",
                            style: TextStyle(
                              color: Color(0xFF14B8A6),
                              fontWeight: FontWeight.bold,
                            ),
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
    );
  }

  Widget _buildUserTypeCard({
    required String emoji,
    required String title,
    required String subtitle,
    required bool selected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          border: Border.all(
            color: selected ? const Color(0xFF14B8A6) : Colors.grey.shade300,
            width: 2,
          ),
          borderRadius: BorderRadius.circular(16),
          color: selected ? const Color(0xFFE6FFFA) : Colors.white,
        ),
        child: Column(
          children: [
            Text(emoji, style: const TextStyle(fontSize: 28)),
            const SizedBox(height: 6),
            Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
            Text(
              subtitle,
              style: const TextStyle(fontSize: 12, color: Colors.grey),
            ),
            if (selected)
              const Icon(Icons.check_circle, color: Color(0xFF14B8A6)),
          ],
        ),
      ),
    );
  }
}
