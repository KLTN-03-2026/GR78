import 'dart:convert';

import 'package:dio/dio.dart';

/// Chuỗi hiển thị cho người dùng từ lỗi API / mạng — ưu tiên nội dung backend.
String describeApiError(
  Object? error, {
  String fallback = 'Đã xảy ra lỗi. Vui lòng thử lại.',
}) {
  if (error == null) return fallback;

  if (error is DioException) {
    final fromBody = _messageFromDio(error);
    if (fromBody != null && fromBody.isNotEmpty) return fromBody;

    final net = _networkHint(error);
    if (net != null) return net;

    if (error.message != null && error.message!.trim().isNotEmpty) {
      return error.message!.trim();
    }
    return fallback;
  }

  final s = error.toString().trim();
  if (s.isEmpty) return fallback;
  if (s.startsWith('Exception: ')) return s.substring('Exception: '.length).trim();
  return s;
}

String? _networkHint(DioException e) {
  switch (e.type) {
    case DioExceptionType.connectionTimeout:
    case DioExceptionType.sendTimeout:
    case DioExceptionType.receiveTimeout:
      return 'Hết thời gian chờ. Kiểm tra kết nối mạng và thử lại.';
    case DioExceptionType.connectionError:
      return 'Không kết nối được tới máy chủ. Kiểm tra mạng hoặc địa chỉ API.';
    case DioExceptionType.badCertificate:
      return 'Lỗi chứng chỉ bảo mật (SSL).';
    case DioExceptionType.cancel:
      return 'Yêu cầu đã bị hủy.';
    default:
      break;
  }
  final code = e.response?.statusCode;
  if (code == 401) {
    return 'Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.';
  }
  if (code == 403) {
    return 'Bạn không có quyền thực hiện thao tác này.';
  }
  if (code == 404) {
    return 'Không tìm thấy tài nguyên trên máy chủ.';
  }
  if (code != null && code >= 500) {
    return 'Máy chủ đang gặp sự cố ($code). Vui lòng thử lại sau.';
  }
  return null;
}

String? _messageFromDio(DioException e) {
  final raw = e.response?.data;
  return _messageFromResponseBody(raw);
}

String? _messageFromResponseBody(dynamic raw) {
  if (raw == null) return null;

  if (raw is String) {
    final t = raw.trim();
    if (t.isEmpty) return null;
    if (t.startsWith('{') || t.startsWith('[')) {
      try {
        final decoded = jsonDecode(t);
        return _messageFromResponseBody(decoded);
      } catch (_) {
        return t.length > 600 ? '${t.substring(0, 600)}…' : t;
      }
    }
    return t.length > 600 ? '${t.substring(0, 600)}…' : t;
  }

  if (raw is Map) {
    final map = Map<String, dynamic>.from(raw);
    return _messageFromMap(map);
  }

  return null;
}

String? _messageFromMap(Map<String, dynamic> map) {
  // Chuẩn ErrorResponseDto: message, code
  final msg = map['message'];
  if (msg is String && msg.trim().isNotEmpty) return msg.trim();

  // Ví dụ moderation: { "details": { "userMessage": "..." } }
  final details = map['details'];
  if (details is Map) {
    final um = details['userMessage'];
    if (um is String && um.trim().isNotEmpty) return um.trim();
  }

  // Một số API: { "error": "..." } hoặc { "error": { "message": "..." } }
  final err = map['error'];
  if (err is String && err.trim().isNotEmpty) return err.trim();
  if (err is Map) {
    final nested = Map<String, dynamic>.from(err);
    final m = _messageFromMap(nested);
    if (m != null) return m;
  }

  // NestJS / class-validator: { "message": ["a","b"] }
  if (msg is List) {
    final parts = msg.whereType<String>().map((s) => s.trim()).where((s) => s.isNotEmpty).toList();
    if (parts.isNotEmpty) return parts.join('\n');
  }

  // { "errors": { "email": ["..."] } }
  final errors = map['errors'];
  if (errors is Map) {
    final parts = <String>[];
    for (final entry in errors.entries) {
      final v = entry.value;
      if (v is List) {
        for (final item in v) {
          if (item is String && item.trim().isNotEmpty) parts.add(item.trim());
        }
      } else if (v is String && v.trim().isNotEmpty) {
        parts.add(v.trim());
      }
    }
    if (parts.isNotEmpty) return parts.join('\n');
  }

  final detail = map['detail'];
  if (detail is String && detail.trim().isNotEmpty) return detail.trim();

  final description = map['description'];
  if (description is String && description.trim().isNotEmpty) {
    return description.trim();
  }

  return null;
}
