import 'package:dio/dio.dart';
import 'package:mobile_app_doan/core/api_error_message.dart';
import 'package:openapi/openapi.dart';
import 'package:mobile_app_doan/utils/device_id.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthRepository {
  final AuthMobileApi _authMobileApi;
  final AuthCommonApi _authCommonApi;
  final AuthWebApi _authWebApi;
  final Dio _dio;

  AuthRepository(
    this._authMobileApi,
    this._authCommonApi,
    this._authWebApi,
    this._dio,
  );

  /// Khớp POST /auth/forgot-password-otp (backend mới — gửi OTP 6 số).
  Future<void> forgotPassword(String email) async {
    try {
      final response = await _dio.post<Object>(
        '/auth/forgot-password-otp',
        data: {'email': email.trim().toLowerCase()},
      );
      _throwIfErrorStatus(response);
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  Future<void> verifyEmail({
    required String email,
    required String otp,
  }) async {
    try {
      final response = await _dio.post<Object>(
        '/auth/verify-email',
        data: {
          'email': email.trim().toLowerCase(),
          'otp': otp.trim(),
        },
      );
      _throwIfErrorStatus(response);
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  Future<void> resendVerification(String email) async {
    try {
      final response = await _dio.post<Object>(
        '/auth/resend-verification',
        data: {'email': email.trim().toLowerCase()},
      );
      _throwIfErrorStatus(response);
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  /// Ném lỗi khi Dio không tự throw do validateStatus cho phép 4xx.
  void _throwIfErrorStatus(Response<Object> response) {
    final status = response.statusCode ?? 0;
    if (status >= 400) {
      final body = response.data;
      String message = 'Lỗi không xác định (HTTP $status)';
      if (body is Map) {
        final raw = body['message'];
        if (raw is String) {
          message = raw;
        } else if (raw is List && raw.isNotEmpty) {
          message = raw.first.toString();
        }
      }
      throw Exception(message);
    }
  }

  /// Đặt lại mật khẩu bằng OTP (POST /auth/reset-password-otp).
  Future<void> resetPasswordWithOtp({
    required String email,
    required String otp,
    required String newPassword,
  }) async {
    try {
      final response = await _dio.post<Object>(
        '/auth/reset-password-otp',
        data: {
          'email': email.trim().toLowerCase(),
          'otp': otp.trim(),
          'newPassword': newPassword,
        },
      );
      _throwIfErrorStatus(response);
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  /// Khớp POST /auth/reset-password (token từ link email).
  Future<void> resetPassword({
    required String token,
    required String newPassword,
  }) async {
    try {
      final response = await _dio.post<Object>(
        '/auth/reset-password',
        data: {'token': token, 'newPassword': newPassword},
      );
      _throwIfErrorStatus(response);
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  /// Đăng xuất mọi thiết bị (OpenAPI: POST /auth/logout-all)
  Future<void> logoutAll() async {
    try {
      await _authCommonApi.authControllerLogoutAll();
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  /// Đăng nhập web (cookie refresh) — dùng khi build Flutter web hoặc test.
  Future<LoginResponseDto> loginWeb(String identifier, String password) async {
    try {
      final body = LoginDto(
        (b) => b
          ..identifier = identifier
          ..password = password,
      );
      final response = await _authWebApi.authControllerLogin(loginDto: body);
      if (response.data == null) {
        throw Exception('Empty response from server');
      }
      return response.data!;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  Future<void> logoutWeb() async {
    try {
      await _authWebApi.authControllerLogout();
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  Future<void> refreshWeb() async {
    try {
      await _authWebApi.authControllerRefresh();
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }
  Future<LoginResponseDto> login(String identifier, String password) async {
    final deviceId = await DeviceInfoHelper.getDeviceDetails();

    try {
      final body = LoginMobileDto(
        (b) => b
          ..identifier = identifier
          ..password = password,
      );

      final response = await _authMobileApi.authControllerLoginMobile(
        xDeviceID: deviceId,
        loginMobileDto: body,
      );

      if (response.data == null) {
        throw Exception("Empty response from server");
      }

      final dto = response.data!;

      // Optional: kiểm tra token có tồn tại không
      if (dto.data?.accessToken == null) {
        throw Exception("Access token missing in response");
      }

      return dto;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  Future<void> logoutMobile() async {
    try {
      final deviceId = await DeviceInfoHelper.getDeviceDetails();
      final prefs = await SharedPreferences.getInstance();
      final refreshToken = prefs.getString("refreshToken");

      if (refreshToken == null || refreshToken.isEmpty) {
        print("⚠️ No refresh token found, skip logoutMobile call");
        return;
      }

      await _authMobileApi.authControllerLogoutMobile(
        xDeviceID: deviceId,
        refreshToken: refreshToken,
      );
    } on DioException catch (e) {
      final status = e.response?.statusCode;
      if (status == 401) {
        // Refresh token có thể đã bị thu hồi bởi logoutDevice hoặc hết hạn
        print("⚠️ Refresh token already invalid, skip logoutMobile");
        return;
      }
      throw Exception(describeApiError(e));
    }
  }

  Future<void> logoutDevice() async {
    try {
      final deviceId = await DeviceInfoHelper.getDeviceDetails();
      final prefs = await SharedPreferences.getInstance();
      final refreshToken = prefs.getString("refreshToken");

      await _authMobileApi.authControllerLogoutDevice(
        xDeviceID: deviceId,
        refreshToken: refreshToken,
      );
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  Future<Map?> refresh(String deviceId, String refreshToken) async {
    try {
      final deviceId = await DeviceInfoHelper.getDeviceDetails();

      final response = await _authMobileApi.authControllerRefreshMobile(
        xDeviceID: deviceId,
        refreshToken: refreshToken,
      );
      return response.data?.asMap;
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }

  Future<void> register(
    String name,
    String phone,
    String email,
    String password,
    UserRole userType,
  ) async {
    try {
      final registerDto = RegisterDto(
        (b) => b
          ..fullName = name
          ..phone = phone
          ..email = email
          ..password = password
          ..role = userType,
      );

      await _authCommonApi.authControllerRegister(registerDto: registerDto);
    } on DioException catch (e) {
      throw Exception(describeApiError(e));
    }
  }
}
