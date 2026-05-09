import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:mobile_app_doan/core/api_error_message.dart';
import 'package:mobile_app_doan/core/theme/app_spacing.dart';
import 'package:mobile_app_doan/core/widgets/app_auth_shell.dart';
import 'package:mobile_app_doan/core/widgets/app_primary_button.dart';
import 'package:mobile_app_doan/features/auth/controllers/auth_controller.dart';

/// Sau đăng ký: nhập OTP 6 số từ email (POST /auth/verify-email).
class VerifyEmailPage extends StatefulWidget {
  const VerifyEmailPage({super.key});

  @override
  State<VerifyEmailPage> createState() => _VerifyEmailPageState();
}

class _VerifyEmailPageState extends State<VerifyEmailPage> {
  final _otp = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _busy = false;
  int _resendSec = 0;
  Timer? _resendTimer;

  String get _email => Uri.decodeComponent(Get.parameters['email'] ?? '').trim();

  @override
  void initState() {
    super.initState();
    _startResendCooldown(60);
  }

  @override
  void dispose() {
    _resendTimer?.cancel();
    _otp.dispose();
    super.dispose();
  }

  void _startResendCooldown(int seconds) {
    _resendTimer?.cancel();
    setState(() => _resendSec = seconds);
    _resendTimer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) return;
      if (_resendSec <= 1) {
        t.cancel();
        setState(() => _resendSec = 0);
      } else {
        setState(() => _resendSec--);
      }
    });
  }

  Future<void> _verify() async {
    if (_email.isEmpty) {
      Get.snackbar('Lỗi', 'Thiếu email. Vui lòng đăng ký lại.');
      return;
    }
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() => _busy = true);
    try {
      await Get.find<AuthController>().verifyEmail(
        email: _email,
        otp: _otp.text.trim(),
      );
      if (mounted) {
        Get.snackbar('Thành công', 'Email đã xác thực. Bạn có thể đăng nhập.');
        Get.offAllNamed('/login');
      }
    } catch (e) {
      Get.snackbar('Lỗi', describeApiError(e));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _resend() async {
    if (_email.isEmpty || _resendSec > 0) return;
    setState(() => _busy = true);
    try {
      await Get.find<AuthController>().resendVerification(_email);
      if (mounted) {
        Get.snackbar('Đã gửi', 'Nếu email hợp lệ, mã OTP mới đã được gửi.');
        _startResendCooldown(60);
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
      title: 'Xác thực email',
      subtitle: _email.isEmpty
          ? 'Thiếu thông tin email'
          : 'Nhập mã 6 số đã gửi tới\n$_email',
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
            const SizedBox(height: AppSpacing.md),
            AppPrimaryButton(
              label: _busy ? 'Đang xác thực...' : 'Xác thực',
              isLoading: _busy,
              onPressed: _busy || _email.isEmpty ? null : _verify,
            ),
            const SizedBox(height: AppSpacing.sm),
            TextButton(
              onPressed: (_busy || _resendSec > 0 || _email.isEmpty) ? null : _resend,
              child: Text(
                _resendSec > 0 ? 'Gửi lại mã (${_resendSec}s)' : 'Gửi lại mã OTP',
              ),
            ),
            TextButton(
              onPressed: _busy ? null : () => Get.offAllNamed('/login'),
              child: const Text('Đã có tài khoản? Đăng nhập'),
            ),
          ],
        ),
      ),
    );
  }
}
