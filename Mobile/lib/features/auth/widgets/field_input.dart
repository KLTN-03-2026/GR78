import 'package:flutter/material.dart';

class InputField extends StatelessWidget {
  final String label;
  final String hint;
  final IconData icon;
  final TextInputType? keyboardType;
  final ValueChanged<String>? onChanged;
  final TextEditingController? controller;
  final String? errorText; // ✅ Thêm để hiển thị lỗi

  const InputField({
    Key? key,
    required this.label,
    required this.hint,
    required this.icon,
    this.keyboardType,
    this.onChanged,
    this.controller,
    this.errorText, // ✅ Thêm parameter
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14),
        ),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          onChanged: onChanged,
          keyboardType: keyboardType,
          decoration: InputDecoration(
            prefixIcon: Icon(
              icon,
              color: errorText != null ? Colors.red : Colors.grey,
            ),
            hintText: hint,
            filled: true,
            fillColor: Colors.grey.shade50,

            // ✅ Hiển thị error text
            errorText: errorText,
            errorMaxLines: 2,
            errorStyle: const TextStyle(fontSize: 12, height: 1.2),

            // ✅ Border bình thường
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(20),
              borderSide: BorderSide(color: Colors.grey.shade300),
            ),

            // ✅ Border khi enabled (không có lỗi)
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(20),
              borderSide: BorderSide(
                color: errorText != null
                    ? Colors.red.shade300
                    : Colors.grey.shade300,
                width: errorText != null ? 1.5 : 1,
              ),
            ),

            // ✅ Border khi focus
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(20),
              borderSide: BorderSide(
                color: errorText != null ? Colors.red : Colors.teal,
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
