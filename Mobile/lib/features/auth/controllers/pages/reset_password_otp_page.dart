import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:mobile_app_doan/core/api_error_message.dart';
import 'package:mobile_app_doan/core/theme/app_spacing.dart';
import 'package:mobile_app_doan/core/widgets/app_auth_shell.dart';
import 'package:mobile_app_doan/core/widgets/app_primary_button.dart';
import 'package:mobile_app_doan/features/auth/controllers/auth_controller.dart';

/// Đặt lại mật khẩu bằng OTP email (POST /auth/reset-password-otp).
class ResetPasswordOtpPage extends StatefulWidget {
  const ResetPasswordOtpPage({super.key});

  @override
  State<ResetPasswordOtpPage> createState() => _ResetPasswordOtpPageState();
}

class _ResetPasswordOtpPageState extends State<ResetPasswordOtpPage> {
  final _otp = TextEditingController();
  final _pass = TextEditingController();
  final _pass2 = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _busy = false;

  String get _email => Uri.decodeComponent(Get.parameters['email'] ?? '').trim();

  @override
  void dispose() {
    _otp.dispose();
    _pass.dispose();
    _pass2.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_email.isEmpty) {
      Get.snackbar('Lỗi', 'Thiếu email. Quay lại bước quên mật khẩu.');
      return;
    }
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() => _busy = true);
    try {
      await Get.find<AuthController>().resetPasswordWithOtp(
        email: _email,
        otp: _otp.text.trim(),
        newPassword: _pass.text,
      );
      if (mounted) {
        Get.snackbar('Thành công', 'Đã đặt lại mật khẩu. Vui lòng đăng nhập.');
        Get.offAllNamed('/login');
      }
    } catch (e) {
      Get.snackbar('Lỗi', describeApiError(e));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final canPop = ModalRoute.of(context)?.canPop ?? false;

    return AppAuthShell(
      title: 'Đặt lại mật khẩu',
      subtitle: _email.isEmpty
          ? 'Thiếu email'
          : 'Nhập mã OTP đã gửi tới\n$_email',
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
              controller: _otp,
              keyboardType: TextInputType.number,
              maxLength: 6,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
              decoration: const InputDecoration(
                labelText: 'Mã OTP',
                counterText: '',
                prefixIcon: Icon(Icons.pin_outlined),
              ),
              validator: (v) {
                if (v == null || v.length != 6) return 'Nhập đúng 6 chữ số';
                return null;
              },
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
