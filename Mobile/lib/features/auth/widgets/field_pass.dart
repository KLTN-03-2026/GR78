import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';

class PasswordField extends StatefulWidget {
  final String label;
  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;
  final String? errorText; // ✅ Thêm để hiển thị lỗi

  const PasswordField({
    Key? key,
    required this.label,
    this.controller,
    this.onChanged,
    this.errorText, // ✅ Thêm parameter
  }) : super(key: key);

  @override
  State<PasswordField> createState() => _PasswordFieldState();
}

class _PasswordFieldState extends State<PasswordField> {
  bool _obscureText = true;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          widget.label,
          style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14),
        ),
        const SizedBox(height: 6),
        TextField(
          controller: widget.controller,
          onChanged: widget.onChanged,
          obscureText: _obscureText,
          decoration: InputDecoration(
            prefixIcon: Icon(
              LucideIcons.lock,
              color: widget.errorText != null ? Colors.red : Colors.grey,
            ),
            suffixIcon: IconButton(
              icon: Icon(
                _obscureText ? LucideIcons.eyeOff : LucideIcons.eye,
                color: widget.errorText != null ? Colors.red : Colors.grey,
              ),
              onPressed: () {
                setState(() {
                  _obscureText = !_obscureText;
                });
              },
            ),
            hintText: "••••••••",
            filled: true,
            fillColor: Colors.grey.shade50,

            // ✅ Hiển thị error text
            errorText: widget.errorText,
            errorMaxLines: 2,
            errorStyle: const TextStyle(fontSize: 12, height: 1.2),

            // ✅ Border bình thường
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(20),
              borderSide: BorderSide(color: Colors.grey.shade300),
            ),

            // ✅ Border khi enabled
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(20),
              borderSide: BorderSide(
                color: widget.errorText != null
                    ? Colors.red.shade300
                    : Colors.grey.shade300,
                width: widget.errorText != null ? 1.5 : 1,
              ),
            ),

            // ✅ Border khi focus
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(20),
              borderSide: BorderSide(
                color: widget.errorText != null ? Colors.red : Colors.teal,
                width: 2,
              ),
            ),

            // ✅ Border khi có lỗi
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(20),
              borderSide: const BorderSide(color: Colors.red, width: 1.5),
            ),

            // ✅ Border khi focus và có lỗi
            focusedErrorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(20),
              borderSide: const BorderSide(color: Colors.red, width: 2),
            ),
          ),
        ),
        const SizedBox(height: 16), // ✅ Spacing giữa các field
      ],
    );
  }
}
