import 'package:flutter/material.dart';

/// Primary CTA — uses [ThemeData] filled button styling from [AppTheme].
class PrimaryButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;

  const PrimaryButton({super.key, required this.text, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: FilledButton(
        onPressed: onPressed,
        child: Text(text),
      ),
    );
  }
}
