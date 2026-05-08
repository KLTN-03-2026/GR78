import 'package:flutter/material.dart';
import 'package:mobile_app_doan/core/theme/app_spacing.dart';

/// Nút đăng nhập / đăng ký social (UI; chưa nối SDK).
class SocialButton extends StatelessWidget {
  const SocialButton({
    super.key,
    required this.label,
    required this.icon,
    this.onPressed,
  });

  final String label;
  final Widget icon;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    final outline = Theme.of(context).colorScheme.outlineVariant;
    return Expanded(
      child: OutlinedButton(
        onPressed: onPressed,
        style: OutlinedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          side: BorderSide(color: outline),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(width: 24, height: 24, child: icon),
            const SizedBox(width: 8),
            Flexible(
              child: Text(
                label,
                style: const TextStyle(fontSize: 16),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Glyph đơn giản (không cần asset) cho preview UI.
class SocialBrandIcons {
  SocialBrandIcons._();

  static Widget google({double size = 24}) {
    return SizedBox(
      width: size,
      height: size,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(size * 0.2),
          border: Border.all(
            color: const Color(0xFF4285F4).withValues(alpha: 0.4),
          ),
        ),
        child: Center(
          child: Text(
            'G',
            style: TextStyle(
              fontSize: size * 0.55,
              fontWeight: FontWeight.w800,
              color: const Color(0xFF4285F4),
              height: 1,
            ),
          ),
        ),
      ),
    );
  }

  static Widget facebook({double size = 24}) {
    return Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      decoration: const BoxDecoration(
        color: Color(0xFF1877F2),
        shape: BoxShape.circle,
      ),
      child: Text(
        'f',
        style: TextStyle(
          color: Colors.white,
          fontSize: size * 0.62,
          fontWeight: FontWeight.w800,
          height: 1,
        ),
      ),
    );
  }
}

/// Divider "Hoặc" + hàng Google / Facebook.
class AuthSocialLoginSection extends StatelessWidget {
  const AuthSocialLoginSection({
    super.key,
    this.isLoginFlow = true,
  });

  final bool isLoginFlow;

  void _placeholderTap(BuildContext context, String name) {
    final action = isLoginFlow ? 'Đăng nhập' : 'Đăng ký';
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          '$action bằng $name đang được kết nối. Vui lòng dùng email hoặc số điện thoại.',
        ),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final line = theme.colorScheme.outlineVariant;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Expanded(child: Divider(color: line, thickness: 1)),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
              child: Text(
                'Hoặc tiếp tục với',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ),
            Expanded(child: Divider(color: line, thickness: 1)),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        Row(
          children: [
            SocialButton(
              label: 'Google',
              icon: SocialBrandIcons.google(),
              onPressed: () => _placeholderTap(context, 'Google'),
            ),
            const SizedBox(width: AppSpacing.sm),
            SocialButton(
              label: 'Facebook',
              icon: SocialBrandIcons.facebook(),
              onPressed: () => _placeholderTap(context, 'Facebook'),
            ),
          ],
        ),
      ],
    );
  }
}
