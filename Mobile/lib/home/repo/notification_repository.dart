import 'package:dio/dio.dart';
import 'package:mobile_app_doan/core/api_error_message.dart';
import 'package:openapi/openapi.dart';

/// Dùng [Dio] chung (có bearer) vì client sinh ra trả [Response<void>] nên không đọc được body qua kiểu tĩnh.
class NotificationRepository {
  final Dio _dio;

  NotificationRepository(Openapi openapi) : _dio = openapi.dio;

  List<Map<String, dynamic>> _parseList(dynamic data) {
    if (data == null) return [];
    if (data is List) {
      return data
          .whereType<Map>()
          .map((e) => Map<String, dynamic>.from(e))
          .toList();
    }
    if (data is Map) {
      for (final key in ['data', 'items', 'notifications', 'results', 'rows']) {
        final v = data[key];
        if (v is List) {
          return v
              .whereType<Map>()
              .map((e) => Map<String, dynamic>.from(e))
              .toList();
        }
      }
    }
    return [];
  }

  int _parseUnreadCount(dynamic data) {
    if (data == null) return 0;
    if (data is num) return data.toInt();
    if (data is Map) {
      for (final key in ['count', 'unreadCount', 'unread', 'total']) {
        final v = data[key];
        if (v is num) return v.toInt();
      }
    }
    return 0;
  }

  Future<List<Map<String, dynamic>>> getNotifications({
    num page = 1,
    num limit = 20,
    bool unreadOnly = false,
  }) async {
    try {
      final res = await _dio.get<dynamic>(
        '/notifications',
        queryParameters: <String, dynamic>{
          'page': page,
          'limit': limit,
          'unreadOnly': unreadOnly,
        },
      );
      return _parseList(res.data);
    } on DioException catch (e) {
      throw Exception(describeApiError(e, fallback: 'Notification request failed'));
    }
  }

  Future<int> getUnreadCount() async {
    try {
      final res = await _dio.get<dynamic>('/notifications/unread-count');
      return _parseUnreadCount(res.data);
    } on DioException catch (e) {
      throw Exception(describeApiError(e, fallback: 'Notification request failed'));
    }
  }

  Future<void> markAsRead(String id) async {
    try {
      await _dio.post<dynamic>('/notifications/$id/read');
    } on DioException catch (e) {
      throw Exception(describeApiError(e, fallback: 'Notification request failed'));
    }
  }

  Future<void> markAllAsRead() async {
    try {
      await _dio.post<dynamic>('/notifications/mark-all-read');
    } on DioException catch (e) {
      throw Exception(describeApiError(e, fallback: 'Notification request failed'));
    }
  }

  Future<void> deleteNotification(String id) async {
    try {
      await _dio.delete<dynamic>('/notifications/$id');
    } on DioException catch (e) {
      throw Exception(describeApiError(e, fallback: 'Notification request failed'));
    }
  }

  Future<void> deleteReadNotifications() async {
    try {
      await _dio.delete<dynamic>('/notifications/read');
    } on DioException catch (e) {
      throw Exception(describeApiError(e, fallback: 'Notification request failed'));
    }
  }
}
