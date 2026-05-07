import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile_app_doan/core/widgets/app_empty_state.dart';
import 'package:mobile_app_doan/core/widgets/app_page_header.dart';

/// Placeholder for features not yet backed by API — keeps navigation consistent.
class ComingSoonPage extends StatelessWidget {
  const ComingSoonPage({
    super.key,
    required this.title,
    this.subtitle = 'Tính năng đang được hoàn thiện. Vui lòng quay lại sau.',
  });

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          AppPageHeader(
            title: title,
            trailing: [
              IconButton(
                onPressed: () => Get.back<void>(),
                icon: const Icon(Icons.close, color: Colors.white),
              ),
            ],
          ),
          Expanded(
            child: AppEmptyState(
              title: 'Sắp ra mắt',
              subtitle: subtitle,
              icon: Icons.construction_outlined,
            ),
          ),
        ],
      ),
    );
  }
}
