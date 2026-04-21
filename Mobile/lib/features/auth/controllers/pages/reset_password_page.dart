import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile_app_doan/features/auth/controllers/auth_controller.dart';
import 'package:mobile_app_doan/features/auth/widgets/button.dart';

/// Token lấy từ email (backend `FRONTEND_URL/reset-password?token=...`).
/// Trên app: truyền `Get.parameters['token']` hoặc nhập tay.
class ResetPasswordPage extends StatefulWidget {
  const ResetPasswordPage({super.key});

  @override
  State<ResetPasswordPage> createState() => _ResetPasswordPageState();
}

class _ResetPasswordPageState extends State<ResetPasswordPage> {
  late final TextEditingController _token;
  final _pass = TextEditingController();
  final _pass2 = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    final fromRoute = Get.parameters['token'] ?? '';
    _token = TextEditingController(text: fromRoute);
  }

  @override
  void dispose() {
    _token.dispose();
    _pass.dispose();
    _pass2.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() => _busy = true);
    try {
      await Get.find<AuthController>().resetPassword(
        token: _token.text.trim(),
        newPassword: _pass.text,
      );
      if (mounted) {
        Get.snackbar('Thành công', 'Đã đặt lại mật khẩu. Vui lòng đăng nhập.');
        Get.offAllNamed('/login');
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
      appBar: AppBar(title: const Text('Đặt lại mật khẩu')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextFormField(
                controller: _token,
                decoration: const InputDecoration(
                  labelText: 'Token từ email',
                  border: OutlineInputBorder(),
                ),
                validator: (v) =>
                    v == null || v.trim().isEmpty ? 'Thiếu token' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _pass,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'Mật khẩu mới',
                  border: OutlineInputBorder(),
                ),
                validator: (v) {
                  if (v == null || v.length < 8) return 'Tối thiểu 8 ký tự';
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _pass2,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'Nhập lại mật khẩu',
                  border: OutlineInputBorder(),
                ),
                validator: (v) {
                  if (v != _pass.text) return 'Mật khẩu không khớp';
                  return null;
                },
              ),
              const SizedBox(height: 24),
              PrimaryButton(
                text: _busy ? 'Đang lưu...' : 'Đặt lại mật khẩu',
                onPressed: _busy ? () {} : _submit,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
