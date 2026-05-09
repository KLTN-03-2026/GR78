import 'package:flutter/material.dart';
import 'package:mobile_app_doan/core/theme/app_colors.dart';
import 'package:mobile_app_doan/core/theme/app_radii.dart';
import 'package:mobile_app_doan/core/theme/app_spacing.dart';

class StartPage extends StatelessWidget {
  final VoidCallback onLogin;
  final VoidCallback onRegister;

  const StartPage({required this.onLogin, required this.onRegister, super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return DecoratedBox(
      decoration: const BoxDecoration(gradient: AppColors.brandGradient),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 96,
                      height: 96,
                      decoration: BoxDecoration(
                        color: theme.colorScheme.surface,
                        borderRadius: BorderRadius.circular(AppRadii.xxl),
                        boxShadow: const [
                          BoxShadow(color: Colors.black26, blurRadius: 10),
                        ],
                      ),
                      child: const Center(
                        child: Text('🔧', style: TextStyle(fontSize: 40)),
                      ),
                    ),
                    const SizedBox(height: AppSpacing.md),
                    Text(
                      'Thợ Tốt',
                      style: theme.textTheme.headlineLarge?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.xs),
                    Text(
                      'Kết nối khách hàng và thợ\nchuyên nghiệp',
                      textAlign: TextAlign.center,
                      style: theme.textTheme.bodyLarge?.copyWith(color: Colors.white70),
                    ),
                  ],
                ),
              ),
              Column(
                children: [
                  FilledButton(
                    style: FilledButton.styleFrom(
                      backgroundColor: theme.colorScheme.surface,
                      foregroundColor: AppColors.seedDark,
                      minimumSize: const Size(double.infinity, 56),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppRadii.lg),
                      ),
                    ),
                    onPressed: onLogin,
                    child: const Text('Đăng nhập', style: TextStyle(fontSize: 18)),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Colors.white, width: 2),
                      foregroundColor: Colors.white,
                      minimumSize: const Size(double.infinity, 56),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppRadii.lg),
                      ),
                    ),
                    onPressed: onRegister,
                    child: const Text('Đăng ký', style: TextStyle(fontSize: 18)),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    'Bằng cách tiếp tục, bạn đồng ý với\nĐiều khoản dịch vụ và Chính sách bảo mật',
                    textAlign: TextAlign.center,
                    style: theme.textTheme.bodySmall?.copyWith(color: Colors.white70),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
