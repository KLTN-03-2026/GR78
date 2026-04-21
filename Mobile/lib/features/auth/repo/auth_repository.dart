import 'package:dio/dio.dart';
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

  /// Khớp POST /auth/forgot-password (email link reset).
  Future<void> forgotPassword(String email) async {
    try {
      await _dio.post<Object>(
        '/auth/forgot-password',
        data: {'email': email.trim().toLowerCase()},
      );
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ?? e.message ?? 'Forgot password failed';
      throw Exception(msg);
    }
  }

  /// Khớp POST /auth/reset-password (token từ link email).
  Future<void> resetPassword({
    required String token,
    required String newPassword,
  }) async {
    try {
      await _dio.post<Object>(
        '/auth/reset-password',
        data: {'token': token, 'newPassword': newPassword},
      );
    } on DioException catch (e) {
      final msg = e.response?.data?['message'] ?? e.message ?? 'Reset password failed';
      throw Exception(msg);
    }
  }

  /// Đăng xuất mọi thiết bị (OpenAPI: POST /auth/logout-all)
  Future<void> logoutAll() async {
    try {
      await _authCommonApi.authControllerLogoutAll();
    } on DioException catch (e) {
      final message =
          e.response?.data?['message'] ?? e.message ?? 'Logout all failed';
      throw Exception(message);
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
      final message =
          e.response?.data?['message'] ?? e.message ?? 'Web login failed';
      throw Exception(message);
    }
  }

  Future<void> logoutWeb() async {
    try {
      await _authWebApi.authControllerLogout();
    } on DioException catch (e) {
      final message =
          e.response?.data?['message'] ?? e.message ?? 'Web logout failed';
      throw Exception(message);
    }
  }

  Future<void> refreshWeb() async {
    try {
      await _authWebApi.authControllerRefresh();
    } on DioException catch (e) {
      final message =
          e.response?.data?['message'] ?? e.message ?? 'Web refresh failed';
      throw Exception(message);
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
      // Lấy message từ server nếu có
      final message =
          e.response?.data?['message'] ?? e.message ?? "Login failed";

      throw Exception(message);
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
      final msg = e.response?.data?['message'] ?? "Logout failed";
      throw Exception(msg);
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
      final msg = e.response?.data?['message'] ?? "Logout device failed";
      throw Exception(msg);
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
      final msg = e.response?.data?['message'] ?? "Refresh token failed";
      throw Exception(msg);
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
      final msg = e.response?.data?['message'] ?? "Registration failed";
      throw Exception(msg);
    }
  }
}
