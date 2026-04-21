import 'package:dio/dio.dart';
import 'package:openapi/openapi.dart';

/// Dùng [Dio] chung (có bearer) vì client sinh ra trả [Response<void>] nên không đọc được body qua kiểu tĩnh.
class NotificationRepository {
  final Dio _dio;

  NotificationRepository(Openapi openapi) : _dio = openapi.dio;

  String _msg(DioException e) {
    final d = e.response?.data;
    if (d is Map && d['message'] != null) return d['message'].toString();
    return e.message ?? 'Notification request failed';
  }

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
      throw Exception(_msg(e));
    }
  }

  Future<int> getUnreadCount() async {
    try {
      final res = await _dio.get<dynamic>('/notifications/unread-count');
      return _parseUnreadCount(res.data);
    } on DioException catch (e) {
      throw Exception(_msg(e));
    }
  }

  Future<void> markAsRead(String id) async {
    try {
      await _dio.post<dynamic>('/notifications/$id/read');
    } on DioException catch (e) {
      throw Exception(_msg(e));
    }
  }

  Future<void> markAllAsRead() async {
    try {
      await _dio.post<dynamic>('/notifications/mark-all-read');
    } on DioException catch (e) {
      throw Exception(_msg(e));
    }
  }

  Future<void> deleteNotification(String id) async {
    try {
      await _dio.delete<dynamic>('/notifications/$id');
    } on DioException catch (e) {
      throw Exception(_msg(e));
    }
  }

  Future<void> deleteReadNotifications() async {
    try {
      await _dio.delete<dynamic>('/notifications/read');
    } on DioException catch (e) {
      throw Exception(_msg(e));
    }
  }
}
