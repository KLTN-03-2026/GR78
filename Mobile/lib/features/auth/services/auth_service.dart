import 'package:mobile_app_doan/home/pages/model/user.dart';
import 'package:openapi/openapi.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  static const _accessTokenKey = "accessToken";
  static const _refreshTokenKey = "refreshToken";
  static const _deviceIdKey = "deviceId";

  static const _userNameKey = "user_name";
  static const _userEmailKey = "user_email";
  static const _userPhoneKey = "user_phone";
  static const _userRoleKey = "user_role";

  Future<void> init() async {
    await SharedPreferences.getInstance();
  }

  Future<void> saveTokens(LoginResponseDataDto dto, String deviceId) async {
    final sp = await SharedPreferences.getInstance();
    await sp.setString(_accessTokenKey, dto.accessToken);
    await sp.setString(_refreshTokenKey, dto.refreshToken);
    await sp.setString(_deviceIdKey, deviceId);
  }

  Future<void> saveUserModel(UserModel user) async {
    final sp = await SharedPreferences.getInstance();
    await sp.setString(_userNameKey, user.userName ?? '');
    await sp.setString(_userEmailKey, user.userEmail ?? '');
    await sp.setString(_userPhoneKey, user.userPhone ?? '');
    await sp.setString(_userRoleKey, user.userRole ?? '');
  }

  Future<UserModel?> getUser() async {
    final sp = await SharedPreferences.getInstance();
    final data = {
      'user_name': sp.getString(_userNameKey),
      'user_email': sp.getString(_userEmailKey),
      'user_phone': sp.getString(_userPhoneKey),
      'user_role': sp.getString(_userRoleKey),
    };

    final user = UserModel.fromSharedPreferences(data);
    return user.isEmpty ? null : user;
  }

  Future<String?> getDeviceId() async {
    final sp = await SharedPreferences.getInstance();
    return sp.getString(_deviceIdKey);
  }

  Future<void> clearTokens() async {
    final sp = await SharedPreferences.getInstance();
    await sp.remove(_accessTokenKey);
    await sp.remove(_refreshTokenKey);
    await sp.remove(_deviceIdKey);
  }

  Future<void> clearUser() async {
    final sp = await SharedPreferences.getInstance();
    await sp.remove(_userNameKey);
    await sp.remove(_userEmailKey);
    await sp.remove(_userPhoneKey);
    await sp.remove(_userRoleKey);
  }

  Future<String?> getAccessToken() async {
    final sp = await SharedPreferences.getInstance();
    return sp.getString(_accessTokenKey);
  }

  Future<String?> getRefreshToken() async {
    final sp = await SharedPreferences.getInstance();
    return sp.getString(_refreshTokenKey);
  }
}
