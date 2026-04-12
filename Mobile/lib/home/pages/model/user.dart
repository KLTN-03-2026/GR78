// File: models/user_model.dart
// User model for managing user information

class UserModel {
  final String? userRole;
  final String? userPhone;
  final String? userEmail;
  final String? userName;

  UserModel({this.userRole, this.userPhone, this.userEmail, this.userName});

  // Convert từ JSON/Map sang UserModel
  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      userRole: json['user_role'] as String?,
      userPhone: json['user_phone'] as String?,
      userEmail: json['user_email'] as String?,
      userName: json['user_name'] as String?,
    );
  }

  // Convert từ UserModel sang JSON/Map
  Map<String, dynamic> toJson() {
    return {
      'user_role': userRole,
      'user_phone': userPhone,
      'user_email': userEmail,
      'user_name': userName,
    };
  }

  // Convert từ SharedPreferences sang UserModel
  factory UserModel.fromSharedPreferences(Map<String, dynamic> prefs) {
    return UserModel(
      userRole: prefs['user_role'] as String?,
      userPhone: prefs['user_phone'] as String?,
      userEmail: prefs['user_email'] as String?,
      userName: prefs['user_name'] as String?,
    );
  }

  // Copy với một số field thay đổi
  UserModel copyWith({
    String? userRole,
    String? userPhone,
    String? userEmail,
    String? userName,
  }) {
    return UserModel(
      userRole: userRole ?? this.userRole,
      userPhone: userPhone ?? this.userPhone,
      userEmail: userEmail ?? this.userEmail,
      userName: userName ?? this.userName,
    );
  }

  // Kiểm tra xem user đã hoàn thiện thông tin chưa
  bool get isProfileComplete {
    return userName != null && userEmail != null && userPhone != null;
  }

  // Kiểm tra có thông tin hay không
  bool get isEmpty {
    return userName == null &&
        userEmail == null &&
        userPhone == null &&
        userRole == null;
  }

  // Kiểm tra có thông tin hay không
  bool get isNotEmpty => !isEmpty;

  // Lấy tên hiển thị (fallback nếu null)
  String get displayName => userName ?? 'Người dùng';

  // Lấy email hiển thị
  String get displayEmail => userEmail ?? 'Chưa cập nhật';

  // Lấy phone hiển thị
  String get displayPhone => userPhone ?? 'Chưa cập nhật';

  // Lấy role hiển thị
  String get displayRole => userRole ?? 'User';

  // Kiểm tra có phải admin không
  bool get isAdmin => userRole?.toLowerCase() == 'admin';

  // Lấy chữ cái đầu từ tên để làm avatar
  String get initials {
    if (userName == null || userName!.isEmpty) return '?';
    List<String> nameParts = userName!.trim().split(' ');
    if (nameParts.length >= 2) {
      return '${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}'
          .toUpperCase();
    }
    return userName![0].toUpperCase();
  }

  @override
  String toString() {
    return 'UserModel(userName: $userName, userEmail: $userEmail, userPhone: $userPhone, userRole: $userRole)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is UserModel &&
        other.userName == userName &&
        other.userEmail == userEmail &&
        other.userPhone == userPhone &&
        other.userRole == userRole;
  }

  @override
  int get hashCode {
    return userName.hashCode ^
        userEmail.hashCode ^
        userPhone.hashCode ^
        userRole.hashCode;
  }
}

// ============================================
// CÁCH SỬ DỤNG
// ============================================

/*
// 1. Tạo UserModel từ JSON
final json = {
  'user_role': 'admin',
  'user_phone': '0901234567',
  'user_email': 'test@email.com',
  'user_name': 'Nguyen Van A',
};
final user = UserModel.fromJson(json);

// 2. Tạo UserModel từ SharedPreferences
import 'package:shared_preferences/shared_preferences.dart';

Future<UserModel?> getUserFromPrefs() async {
  final prefs = await SharedPreferences.getInstance();
  
  final userMap = {
    'user_role': prefs.getString('user_role'),
    'user_phone': prefs.getString('user_phone'),
    'user_email': prefs.getString('user_email'),
    'user_name': prefs.getString('user_name'),
  };
  
  final user = UserModel.fromSharedPreferences(userMap);
  
  // Kiểm tra nếu user rỗng
  if (user.isEmpty) {
    return null;
  }
  
  return user;
}

// 3. Lưu UserModel vào SharedPreferences
Future<void> saveUserToPrefs(UserModel user) async {
  final prefs = await SharedPreferences.getInstance();
  final json = user.toJson();
  
  await prefs.setString('user_role', json['user_role'] ?? '');
  await prefs.setString('user_phone', json['user_phone'] ?? '');
  await prefs.setString('user_email', json['user_email'] ?? '');
  await prefs.setString('user_name', json['user_name'] ?? '');
}

// 4. Sử dụng các getter
void exampleUsage() async {
  final user = await getUserFromPrefs();
  
  if (user != null && user.isNotEmpty) {
    print('Tên: ${user.displayName}');
    print('Email: ${user.displayEmail}');
    print('Phone: ${user.displayPhone}');
    print('Role: ${user.displayRole}');
    print('Avatar: ${user.initials}');
    print('Is Admin: ${user.isAdmin}');
    print('Profile Complete: ${user.isProfileComplete}');
  } else {
    print('Chưa có thông tin user');
  }
}

// 5. Copy với thay đổi
void exampleCopyWith() async {
  final user = await getUserFromPrefs();
  
  if (user != null) {
    final updatedUser = user.copyWith(
      userName: 'Tran Van B',
      userPhone: '0987654321',
    );
    
    await saveUserToPrefs(updatedUser);
  }
}

// 6. Sử dụng trong Widget
class ProfileWidget extends StatelessWidget {
  final UserModel user;
  
  const ProfileWidget({required this.user});
  
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Avatar với initials
        CircleAvatar(
          radius: 40,
          child: Text(
            user.initials,
            style: TextStyle(fontSize: 32),
          ),
        ),
        SizedBox(height: 8),
        Text(user.displayName, style: TextStyle(fontSize: 18)),
        Text(user.displayEmail, style: TextStyle(color: Colors.grey)),
        Text(user.displayPhone),
        
        // Badge cho admin
        if (user.isAdmin)
          Chip(
            label: Text('ADMIN'),
            backgroundColor: Colors.orange,
          ),
      ],
    );
  }
}

// 7. Sử dụng với GetX Controller
import 'package:get/get.dart';

class UserController extends GetxController {
  final Rxn<UserModel> user = Rxn<UserModel>();
  final RxBool isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    loadUser();
  }

  Future<void> loadUser() async {
    isLoading.value = true;
    user.value = await getUserFromPrefs();
    isLoading.value = false;
  }

  Future<void> updateUser(UserModel newUser) async {
    await saveUserToPrefs(newUser);
    user.value = newUser;
    
    Get.snackbar(
      'Thành công',
      'Đã cập nhật thông tin',
      snackPosition: SnackPosition.BOTTOM,
    );
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    user.value = null;
    
    Get.offAllNamed('/login');
  }

  // Getters
  bool get isLoggedIn => user.value?.isNotEmpty ?? false;
  String get userName => user.value?.displayName ?? 'Guest';
  bool get isAdmin => user.value?.isAdmin ?? false;
}

// 8. Sử dụng trong Widget với GetX
class ProfilePage extends StatelessWidget {
  final UserController controller = Get.find();

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      if (controller.isLoading.value) {
        return Center(child: CircularProgressIndicator());
      }

      final user = controller.user.value;
      
      if (user == null || user.isEmpty) {
        return Center(child: Text('Chưa đăng nhập'));
      }

      return ProfileWidget(user: user);
    });
  }
}
*/
