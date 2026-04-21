import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile_app_doan/features/auth/controllers/auth_controller.dart';
import 'package:mobile_app_doan/features/auth/widgets/button.dart';

class ForgotPasswordPage extends StatefulWidget {
  const ForgotPasswordPage({super.key});

  @override
  State<ForgotPasswordPage> createState() => _ForgotPasswordPageState();
}

class _ForgotPasswordPageState extends State<ForgotPasswordPage> {
  final _email = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _busy = false;

  @override
  void dispose() {
    _email.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() => _busy = true);
    try {
      await Get.find<AuthController>().forgotPassword(_email.text.trim());
      if (mounted) {
        Get.snackbar(
          'Đã gửi',
          'Nếu email đã đăng ký, bạn sẽ nhận link đặt lại mật khẩu.',
        );
        Get.offNamed('/login');
      }
    } catch (e) {
      Get.snackbar('Lỗi', e.toString());
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Quên mật khẩu')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Nhập email đã đăng ký. Server sẽ gửi link đặt lại mật khẩu (nếu email tồn tại).',
              ),
              const SizedBox(height: 24),
              TextFormField(
                controller: _email,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(
                  labelText: 'Email',
                  border: OutlineInputBorder(),
                ),
                validator: (v) {
                  if (v == null || v.trim().isEmpty) return 'Vui lòng nhập email';
                  if (!v.contains('@')) return 'Email không hợp lệ';
                  return null;
                },
              ),
              const SizedBox(height: 24),
              PrimaryButton(
                text: _busy ? 'Đang gửi...' : 'Gửi yêu cầu',
                onPressed: _busy ? () {} : _submit,
              ),
              TextButton(
                onPressed: _busy ? null : () => Get.offNamed('/login'),
                child: const Text('Quay lại đăng nhập'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
