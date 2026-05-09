import 'package:flutter/material.dart';
import 'package:mobile_app_doan/core/theme/app_radii.dart';

/// Mức ngữ nghĩa của một trạng thái — dùng để chọn màu badge.
enum AppStatusTone {
  neutral,
  info,
  success,
  warning,
  danger,
}

/// Pill nhỏ hiển thị trạng thái (đơn hàng, chứng chỉ, gói…),
/// thay thế cho các Container tự build có padding/màu khác nhau.
class AppStatusBadge extends StatelessWidget {
  const AppStatusBadge({
    super.key,
    required this.label,
    this.tone = AppStatusTone.neutral,
    this.icon,
    this.dense = false,
  });

  final String label;
  final AppStatusTone tone;
  final IconData? icon;
  final bool dense;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final palette = _palette(scheme, tone);

    final hPad = dense ? 8.0 : 10.0;
    final vPad = dense ? 3.0 : 5.0;
    final fontSize = dense ? 11.0 : 12.0;

    return Container(
      padding: EdgeInsets.symmetric(horizontal: hPad, vertical: vPad),
      decoration: BoxDecoration(
        color: palette.bg,
        borderRadius: BorderRadius.circular(AppRadii.sm + 2),
        border: Border.all(color: palette.fg.withValues(alpha: 0.18)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: fontSize + 2, color: palette.fg),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: TextStyle(
              color: palette.fg,
              fontSize: fontSize,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.1,
            ),
          ),
        ],
      ),
    );
  }

  static _BadgePalette _palette(ColorScheme scheme, AppStatusTone tone) {
    switch (tone) {
      case AppStatusTone.success:
        return _BadgePalette(
          fg: const Color(0xFF15803D),
          bg: const Color(0xFFDCFCE7),
        );
      case AppStatusTone.warning:
        return _BadgePalette(
          fg: const Color(0xFFB45309),
          bg: const Color(0xFFFEF3C7),
        );
      case AppStatusTone.danger:
        return _BadgePalette(fg: scheme.error, bg: scheme.errorContainer);
      case AppStatusTone.info:
        return _BadgePalette(
          fg: scheme.primary,
          bg: scheme.primary.withValues(alpha: 0.12),
        );
      case AppStatusTone.neutral:
        return _BadgePalette(
          fg: scheme.onSurfaceVariant,
          bg: scheme.surfaceContainerHighest.withValues(alpha: 0.55),
        );
    }
  }
}

class _BadgePalette {
  const _BadgePalette({required this.fg, required this.bg});
  final Color fg;
  final Color bg;
}
