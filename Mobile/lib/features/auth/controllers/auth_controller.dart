import 'package:get/get.dart';
import 'package:mobile_app_doan/core/token_helper.dart';
import 'package:mobile_app_doan/features/auth/repo/auth_repository.dart';
import 'package:mobile_app_doan/features/auth/services/auth_service.dart';
import 'package:mobile_app_doan/home/controllers/chat_controller.dart';
import 'package:mobile_app_doan/home/controllers/notification_controller.dart';
import 'package:mobile_app_doan/home/pages/model/user.dart';
import 'package:mobile_app_doan/home/repo/user_repository.dart';
import 'package:mobile_app_doan/main.dart';
import 'package:mobile_app_doan/utils/device_id.dart';
import 'package:openapi/openapi.dart';

class AuthController extends GetxController {
  final AuthRepository repository;
  final AuthService authService;
  final ProfileRepository profileRepository;

  AuthController({
    required this.repository,
    required this.authService,
    required this.profileRepository,
  });

  /// STATE
  var isLoading = false.obs;
  var isLoggedIn = false.obs;
  var userName = ''.obs;
  var userEmail = ''.obs;

  /// -------------------------------------------
  /// 🔹 LOGIN
  /// -------------------------------------------
  Future<void> loginMobile(String identifier, String password) async {
    isLoading.value = true;

    try {
      final deviceId = await DeviceInfoHelper.getDeviceDetails();
      final res = await repository.login(identifier, password);
      final loginData = res.data;
      if (loginData == null) {
        throw Exception("Không nhận được token từ server");
      }

      await authService.saveTokens(loginData, deviceId);

      if (globalApi != null) {
        globalApi!.setBearerAuth('bearer', loginData.accessToken);
      }

      await _syncProfileFromServer();

      isLoggedIn.value = true;

      if (Get.isRegistered<NotificationController>()) {
        await Get.find<NotificationController>().connectNotificationSocket();
      }
      if (Get.isRegistered<ChatController>()) {
        await Get.find<ChatController>().connectChatSocket();
      }

      Get.snackbar("Thành công", "Đăng nhập thành công");
      Get.offAllNamed("/home");
    } catch (e) {
      Get.snackbar("Lỗi", e.toString());
    } finally {
      isLoading.value = false;
    }
  }

  /// -------------------------------------------
  /// 🔹 REFRESH TOKEN
  /// -------------------------------------------
  Future<Map?> refreshToken() async {
    isLoading.value = true;

    try {
      final deviceId = await authService.getDeviceId();
      final refreshToken = await authService.getRefreshToken();
      if (deviceId == null) throw "Không tìm thấy deviceId";

      final response = await repository.refresh(deviceId, refreshToken!);
      Get.snackbar("Thành công", "Token đã được làm mới");
      return response;
    } catch (e) {
      Get.snackbar("Lỗi", e.toString());
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  /// -------------------------------------------
  /// 🔹 LOGOUT
  /// -------------------------------------------
  var isLoggingOut = false.obs;

  /// Thu hồi refresh token trên mọi thiết bị (OpenAPI logout-all), sau đó xóa session cục bộ.
  Future<void> logoutAllDevices() async {
    isLoggingOut.value = true;
    var hasError = false;

    try {
      await repository.logoutAll();
    } catch (e) {
      print('❌ Logout-all error: $e');
      hasError = true;
    } finally {
      if (Get.isRegistered<NotificationController>()) {
        await Get.find<NotificationController>().disconnectNotificationSocket();
      }
      if (Get.isRegistered<ChatController>()) {
        await Get.find<ChatController>().disconnectChatSocket();
      }
      await TokenHelper.clearTokens();
      await authService.clearTokens();
      await authService.clearUser();
      if (globalApi != null) {
        globalApi!.setBearerAuth('bearer', '');
      }
      isLoggedIn.value = false;
      userName.value = '';
      userEmail.value = '';
      Get.offAllNamed('/login');
      if (hasError) {
        Future.delayed(const Duration(milliseconds: 300), () {
          Get.snackbar('Thông báo', 'Đã đăng xuất (API logout-all có lỗi)');
        });
      }
      isLoggingOut.value = false;
    }
  }

  Future<void> logout() async {
    isLoggingOut.value = true;
    var hasError = false;

    try {
      final deviceId = await authService.getDeviceId();

      if (deviceId != null) {
        await repository.logoutDevice();
        await TokenHelper.clearTokens();
      }
    } catch (e) {
      print("❌ Logout error: $e");
      hasError = true;
    } finally {
      if (Get.isRegistered<NotificationController>()) {
        await Get.find<NotificationController>().disconnectNotificationSocket();
      }
      if (Get.isRegistered<ChatController>()) {
        await Get.find<ChatController>().disconnectChatSocket();
      }
      await authService.clearTokens();
      await authService.clearUser();

      isLoggedIn.value = false;
      userName.value = "";
      userEmail.value = "";

      Get.offAllNamed("/login");

      if (hasError) {
        Future.delayed(const Duration(milliseconds: 300), () {
          Get.snackbar("Thông báo", "Đã đăng xuất (có lỗi nhỏ)");
        });
      }

      isLoggingOut.value = false;
    }
  }

  Future<void> loadUserInfo() async {
    final access = await authService.getAccessToken();
    final refresh = await authService.getRefreshToken();
    if (access != null && refresh != null) {
      isLoggedIn.value = true;
      final user = await authService.getUser();
      if (user != null) {
        userName.value = user.userName ?? '';
        userEmail.value = user.userEmail ?? '';
      }
    }
  }

  Future<void> forgotPassword(String email) async {
    isLoading.value = true;
    try {
      await repository.forgotPassword(email);
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> resetPassword({
    required String token,
    required String newPassword,
  }) async {
    isLoading.value = true;
    try {
      await repository.resetPassword(token: token, newPassword: newPassword);
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> register(
    String name,
    String phone,
    String email,
    String password,
    UserRole userType,
  ) async {
    isLoading.value = true;
    try {
      await repository.register(name, phone, email, password, userType);
      Get.snackbar("Thành công", "Đăng ký thành công. Vui lòng đăng nhập.");
      Get.offAllNamed("/login");
    } catch (e) {
      Get.snackbar("Lỗi", e.toString());
      print(e.toString());
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> _syncProfileFromServer() async {
    try {
      final profile = await profileRepository.getMyProfile();
      final cachedUser = UserModel(
        userName: profile.displayName ?? profile.fullName,
        userEmail: profile.email,
        userPhone: profile.phone,
        userRole: profile.role.name,
      );

      await authService.saveUserModel(cachedUser);
      userName.value = cachedUser.userName ?? '';
      userEmail.value = cachedUser.userEmail ?? '';
    } catch (e) {
      print("⚠️ Không thể đồng bộ profile ngay sau đăng nhập: $e");
      final cachedUser = await authService.getUser();
      if (cachedUser != null) {
        userName.value = cachedUser.userName ?? '';
        userEmail.value = cachedUser.userEmail ?? '';
      }
    }
  }
}
