import 'package:dio/dio.dart';
import 'package:mobile_app_doan/utils/device_id.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:async';

final dio = Dio(
  BaseOptions(
    baseUrl: 'https://postmaxillary-variably-justa.ngrok-free.dev/api/v1',
    connectTimeout: const Duration(seconds: 30),
    receiveTimeout: const Duration(seconds: 30),
    sendTimeout: const Duration(seconds: 30),
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    validateStatus: (status) {
      return status != null && status < 500;
    },
  ),
);

// 🔹 Dio riêng để refresh token — tránh vòng lặp interceptor
final Dio _refreshDio = Dio(
  BaseOptions(
    baseUrl: 'https://postmaxillary-variably-justa.ngrok-free.dev/api/v1',
    connectTimeout: const Duration(seconds: 30),
    receiveTimeout: const Duration(seconds: 30),
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
  ),
);

// 🔹 Callback để xử lý logout từ interceptor
typedef OnUnauthorizedCallback = void Function();
OnUnauthorizedCallback? _onUnauthorizedCallback;

void setOnUnauthorizedCallback(OnUnauthorizedCallback callback) {
  _onUnauthorizedCallback = callback;
}

// 🔹 Quản lý trạng thái refresh token để tránh race condition
class _TokenRefreshManager {
  static final _TokenRefreshManager _instance =
      _TokenRefreshManager._internal();
  factory _TokenRefreshManager() => _instance;
  _TokenRefreshManager._internal();

  bool _isRefreshing = false;
  final List<Completer<String?>> _pendingRequests = [];

  bool get isRefreshing => _isRefreshing;

  void startRefreshing() {
    _isRefreshing = true;
  }

  void stopRefreshing() {
    _isRefreshing = false;
  }

  Completer<String?> addPendingRequest() {
    final completer = Completer<String?>();
    _pendingRequests.add(completer);
    return completer;
  }

  void completePendingRequests(String? newToken) {
    for (var completer in _pendingRequests) {
      if (!completer.isCompleted) {
        completer.complete(newToken);
      }
    }
    _pendingRequests.clear();
  }

  void cancelPendingRequests(dynamic error) {
    for (var completer in _pendingRequests) {
      if (!completer.isCompleted) {
        completer.completeError(error);
      }
    }
    _pendingRequests.clear();
  }
}

final _refreshManager = _TokenRefreshManager();

void setupInterceptors() {
  setupInterceptorsForDio(dio);
}

void setupInterceptorsForDio(Dio targetDio) {
  // Kiểm tra xem interceptor đã được thêm chưa
  final hasOurInterceptor = targetDio.interceptors.any(
    (interceptor) =>
        interceptor.runtimeType.toString().contains('TokenRefreshInterceptor'),
  );

  if (hasOurInterceptor) {
    print('⚠️ Interceptor đã tồn tại, bỏ qua');
    return;
  }

  print('✅ Adding TokenRefreshInterceptor');

  targetDio.interceptors.insert(0, _TokenRefreshInterceptor());
}

// 🔹 Custom Interceptor class để dễ identify
class _TokenRefreshInterceptor extends Interceptor {
  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    try {
      final prefs = await SharedPreferences.getInstance();

      // Attach bearer token
      final token = prefs.getString('accessToken');
      if (token != null && token.isNotEmpty) {
        options.headers['Authorization'] = 'Bearer $token';
      }

      // Attach device id
      final deviceId = prefs.getString('deviceId');
      if (deviceId != null && deviceId.isNotEmpty) {
        options.headers['x-device-id'] = deviceId;
      }

      // Đảm bảo ngrok header luôn có
      options.headers['ngrok-skip-browser-warning'] = 'true';

      handler.next(options);
    } catch (e) {
      print('🔴 Error in onRequest: $e');
      handler.next(options);
    }
  }

  @override
  void onError(DioException error, ErrorInterceptorHandler handler) async {
    // Chỉ xử lý lỗi 401 Unauthorized
    if (error.response?.statusCode == 401) {
      print('⚠️ 401 Unauthorized detected');
      final requestOptions = error.requestOptions;

      // ✅ Nếu đang refresh token, đợi kết quả
      if (_refreshManager.isRefreshing) {
        print('⏳ Waiting for token refresh...');
        try {
          final newToken = await _refreshManager.addPendingRequest().future;

          if (newToken != null && newToken.isNotEmpty) {
            print('✅ Got new token from pending queue, retrying request');
            // Retry request với token mới
            requestOptions.headers['Authorization'] = 'Bearer $newToken';

            // Lấy dio instance từ request options
            final dioInstance =
                error.requestOptions.extra['dioInstance'] as Dio? ?? dio;
            final response = await dioInstance.fetch(requestOptions);
            return handler.resolve(response);
          } else {
            print('❌ New token is null, rejecting request');
            return handler.reject(error);
          }
        } catch (e) {
          print('🔴 Error waiting for refresh: $e');
          return handler.reject(error);
        }
      }

      // ✅ Bắt đầu refresh token process
      print('🔄 Starting token refresh...');
      _refreshManager.startRefreshing();

      try {
        final prefs = await SharedPreferences.getInstance();
        final refreshToken = prefs.getString('refreshToken');

        if (refreshToken == null || refreshToken.isEmpty) {
          throw Exception('No refresh token available');
        }

        print('📤 Calling refresh token API...');
        final deviceId = await DeviceInfoHelper.getDeviceDetails();
        // ❗ Dùng _refreshDio để tránh vòng lặp interceptor
        final refreshResponse = await _refreshDio.post(
          '/auth/refresh-mobile',
          data: {'refreshToken': refreshToken},
          options: Options(headers: {'X-Device-ID': deviceId}),
        );

        print('📥 Refresh response status: ${refreshResponse.statusCode}');

        if (refreshResponse.statusCode == 200 && refreshResponse.data != null) {
          final newAccessToken = refreshResponse.data['accessToken'];
          final newRefreshToken = refreshResponse.data['refreshToken'];

          if (newAccessToken == null || newAccessToken.toString().isEmpty) {
            throw Exception('Invalid refresh response: missing accessToken');
          }

          print('✅ Got new tokens, saving...');

          // ✅ Lưu tokens mới
          await prefs.setString('accessToken', newAccessToken);
          if (newRefreshToken != null) {
            await prefs.setString('refreshToken', newRefreshToken);
          }

          // ✅ Thông báo cho tất cả requests đang đợi
          _refreshManager.completePendingRequests(newAccessToken);

          print('🔄 Retrying original request...');

          // ✅ Retry request ban đầu
          requestOptions.headers['Authorization'] = 'Bearer $newAccessToken';

          // Lấy dio instance từ request options hoặc dùng dio global
          final dioInstance =
              error.requestOptions.extra['dioInstance'] as Dio? ?? dio;
          final clonedRequest = await dioInstance.fetch(requestOptions);

          return handler.resolve(clonedRequest);
        } else {
          throw Exception(
            'Refresh token failed: status ${refreshResponse.statusCode}',
          );
        }
      } catch (e) {
        print('🔴 Token refresh failed: $e');

        // ✅ Hủy tất cả requests đang đợi
        _refreshManager.cancelPendingRequests(e);

        // ✅ Xóa tokens
        try {
          final prefs = await SharedPreferences.getInstance();
          await prefs.remove('accessToken');
          await prefs.remove('refreshToken');
          print('🗑️ Cleared tokens from storage');
        } catch (clearError) {
          print('🔴 Error clearing tokens: $clearError');
        }

        // ✅ Gọi callback để logout user
        if (_onUnauthorizedCallback != null) {
          print('📢 Calling onUnauthorized callback');
          _onUnauthorizedCallback!();
        } else {
          print('⚠️ No onUnauthorized callback set');
        }

        return handler.reject(error);
      } finally {
        _refreshManager.stopRefreshing();
      }
    }

    // Các lỗi khác, pass qua
    handler.next(error);
  }
}
