import 'package:flutter/material.dart';

/// Brand palette — primary tone must stay aligned with existing app (#14B8A6 teal).
abstract final class AppColors {
  static const Color seed = Color(0xFF14B8A6);
  static const Color seedDark = Color(0xFF0D9488);
  static const Color seedLight = Color(0xFF2DD4BF);

  static const LinearGradient brandGradient = LinearGradient(
    colors: [seed, seedDark],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient brandGradientHorizontal = LinearGradient(
    colors: [seed, seedDark],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  /// Soft tint for selected chips / highlights (was 0xFFE6FFFA in register).
  static const Color brandTint = Color(0xFFE6FFFA);
}
