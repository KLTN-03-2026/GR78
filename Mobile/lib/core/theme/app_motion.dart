import 'package:flutter/material.dart';

/// Shared motion tokens — keep durations short for snappy UI on mobile.
abstract final class AppMotion {
  static const Duration fast = Duration(milliseconds: 160);
  static const Duration medium = Duration(milliseconds: 260);
  static const Duration slow = Duration(milliseconds: 380);

  static const Curve emphasized = Curves.easeOutCubic;
  static const Curve decelerate = Curves.easeInCubic;

  /// GetX route push / pop.
  static const Duration routeTransition = Duration(milliseconds: 280);

  /// Auth inner screen switcher.
  static const Duration authSwitcher = Duration(milliseconds: 280);
}
