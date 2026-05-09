import 'package:openapi/openapi.dart';

/// User id của chủ bài (khách) — gom root [PostResponseDto.customerId] và [PostResponseDto.customer].
String? postAuthorUserId(PostResponseDto post) {
  final root = post.customerId;
  if (root != null && root.isNotEmpty) return root;
  final nested = post.customer.id;
  if (nested != null && nested.isNotEmpty) return nested;
  return null;
}
