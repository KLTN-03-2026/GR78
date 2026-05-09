import 'package:flutter/material.dart';
import 'package:mobile_app_doan/core/theme/app_motion.dart';
import 'package:mobile_app_doan/features/auth/controllers/pages/login_page.dart';
import 'package:mobile_app_doan/features/auth/controllers/pages/register_page.dart';
import 'package:mobile_app_doan/features/auth/controllers/pages/start_page.dart';

class Auth_Screen extends StatefulWidget {
  const Auth_Screen({super.key});

  @override
  State<Auth_Screen> createState() => _Auth_ScreenState();
}

class _Auth_ScreenState extends State<Auth_Screen> {
  String screen = 'start';

  void changeScreen(String newScreen) {
    setState(() {
      screen = newScreen;
    });
  }

  @override
  Widget build(BuildContext context) {
    Widget currentPage;

    switch (screen) {
      case 'login':
        currentPage = LoginPage(
          key: const ValueKey('login'),
          onBack: () => changeScreen('start'),
          onRegister: () => changeScreen('register'),
        );
        break;
      case 'register':
        currentPage = RegisterPage(
          key: const ValueKey('register'),
          onBack: () => changeScreen('start'),
          onLogin: () => changeScreen('login'),
        );
        break;
      default:
        currentPage = StartPage(
          key: const ValueKey('start'),
          onLogin: () => changeScreen('login'),
          onRegister: () => changeScreen('register'),
        );
    }

    return Scaffold(
      body: AnimatedSwitcher(
        duration: AppMotion.authSwitcher,
        switchInCurve: AppMotion.emphasized,
        switchOutCurve: AppMotion.decelerate,
        transitionBuilder: (child, animation) {
          final offset = Tween<Offset>(
            begin: const Offset(0.02, 0),
            end: Offset.zero,
          ).animate(CurvedAnimation(parent: animation, curve: AppMotion.emphasized));
          return FadeTransition(
            opacity: CurvedAnimation(parent: animation, curve: Curves.easeOut),
            child: SlideTransition(position: offset, child: child),
          );
        },
        child: currentPage,
      ),
    );
  }
}
