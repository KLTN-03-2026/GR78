import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile_app_doan/core/theme/app_spacing.dart';
import 'package:mobile_app_doan/core/widgets/app_auth_shell.dart';
import 'package:mobile_app_doan/core/widgets/app_primary_button.dart';
import 'package:mobile_app_doan/features/auth/controllers/auth_controller.dart';

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
    final canPop = ModalRoute.of(context)?.canPop ?? false;

    return AppAuthShell(
      title: 'Đặt lại mật khẩu',
      subtitle: 'Nhập token từ email và mật khẩu mới',
      leading: canPop
          ? IconButton(
              onPressed: () => Get.back<void>(),
              icon: const Icon(Icons.arrow_back, color: Colors.white, size: 28),
            )
          : const SizedBox(height: 40),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextFormField(
              controller: _token,
              decoration: const InputDecoration(
                labelText: 'Token từ email',
                prefixIcon: Icon(Icons.vpn_key_outlined),
              ),
              validator: (v) =>
                  v == null || v.trim().isEmpty ? 'Thiếu token' : null,
            ),
            const SizedBox(height: AppSpacing.sm),
            TextFormField(
              controller: _pass,
              obscureText: true,
              decoration: const InputDecoration(
                labelText: 'Mật khẩu mới',
                prefixIcon: Icon(Icons.lock_outline),
              ),
              validator: (v) {
                if (v == null || v.length < 8) return 'Tối thiểu 8 ký tự';
                return null;
              },
            ),
            const SizedBox(height: AppSpacing.sm),
            TextFormField(
              controller: _pass2,
              obscureText: true,
              decoration: const InputDecoration(
                labelText: 'Nhập lại mật khẩu',
                prefixIcon: Icon(Icons.lock_reset),
              ),
              validator: (v) {
                if (v != _pass.text) return 'Mật khẩu không khớp';
                return null;
              },
            ),
            const SizedBox(height: AppSpacing.md),
            AppPrimaryButton(
              label: _busy ? 'Đang lưu...' : 'Đặt lại mật khẩu',
              isLoading: _busy,
              onPressed: _busy ? null : _submit,
            ),
          ],
        ),
      ),
    );
  }
}
