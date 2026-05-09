import 'package:shared_preferences/shared_preferences.dart';

// Hàm lấy thông tin user
Future<Map<String, String?>> getUserInfo() async {
  final prefs = await SharedPreferences.getInstance();

  return {
    'user_role': prefs.getString('user_role'),
    'user_phone': prefs.getString('user_phone'),
    'user_email': prefs.getString('user_email'),
    'user_name': prefs.getString('user_name'),
    'access_token': prefs.getString('access_token'),
    'refresh_token': prefs.getString('refresh_token'),
    'user_id': prefs.getString('user_id'),
  };
}

// Sử dụng
void checkUser() async {
  final userInfo = await getUserInfo();

  if (userInfo['access_token'] != null) {
    print('User: ${userInfo['user_name']}');
    print('Email: ${userInfo['user_email']}');
  } else {
    print('Chưa đăng nhập');
  }
}

// Hoặc lấy từng field riêng lẻ
Future<String?> getAccessToken() async {
  final prefs = await SharedPreferences.getInstance();
  return prefs.getString('access_token');
}

Future<String?> getUserName() async {
  final prefs = await SharedPreferences.getInstance();
  return prefs.getString('user_name');
}
