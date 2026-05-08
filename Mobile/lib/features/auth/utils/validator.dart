class Validators {
  /// Email hoặc SĐT (VN: 10 số bắt đầu 0; cho phép +84 / 84).
  static String? validateLoginIdentifier(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Vui lòng nhập email hoặc số điện thoại';
    }
    final t = value.trim();
    if (t.contains('@')) {
      final email = t.toLowerCase();
      final regex = RegExp(r'^[\w\.-]+@[\w\.-]+\.\w+$');
      if (!regex.hasMatch(email)) {
        return 'Email không hợp lệ';
      }
      return null;
    }
    var digits = t.replaceAll(RegExp(r'\s'), '');
    if (digits.startsWith('+84')) {
      digits = '0${digits.substring(3)}';
    } else if (digits.startsWith('84') && digits.length >= 10) {
      digits = '0${digits.substring(2)}';
    }
    if (!RegExp(r'^0[0-9]{9}$').hasMatch(digits)) {
      return 'Số điện thoại không hợp lệ';
    }
    return null;
  }

  static String? validateEmail(String? value) {
    if (value == null || value.trim().isEmpty) {
      return "Email is required";
    }

    final email = value.trim().toLowerCase();
    final regex = RegExp(r"^[\w\.-]+@[\w\.-]+\.\w+$");

    if (!regex.hasMatch(email)) {
      return "Invalid email format";
    }

    return null;
  }

  static String? validatePhone(String? value) {
    if (value == null || value.trim().isEmpty) {
      return "Phone number is required";
    }

    final phone = value.trim();

    if (phone[0] != '0' && phone.length != 10) {
      return "Invalid phone format";
    }

    return null;
  }

  static String? validateFullName(String? value) {
    if (value == null || value.trim().isEmpty) {
      return "Full name is required";
    }

    final fullName = value.trim();

    if (fullName.length < 2) {
      return "Full name must be at least 2 characters";
    }

    if (fullName.length > 100) {
      return "Full name must not exceed 100 characters";
    }

    return null;
  }

  static String? validatePassword(String? value1, String? value2) {
    // Check password
    if (value1 == null || value1.trim().isEmpty) {
      return "Password is required";
    }

    // Check confirm password
    if (value2 == null || value2.trim().isEmpty) {
      return "Confirm password is required";
    }

    final password = value1.trim();
    final confirmPassword = value2.trim();

    // Password strength rules
    final minLen = RegExp(r'.{8,}');
    final hasUpper = RegExp(r'[A-Z]');
    final hasLower = RegExp(r'[a-z]');
    final hasNumber = RegExp(r'[0-9]');
    final hasSpecial = RegExp(r'[!@#\$%\^&\*(),.?":{}|<>]');

    if (!minLen.hasMatch(password) ||
        !hasUpper.hasMatch(password) ||
        !hasLower.hasMatch(password) ||
        !hasNumber.hasMatch(password) ||
        !hasSpecial.hasMatch(password)) {
      return "Password must contain at least 8 characters, including uppercase, lowercase, number, and special character";
    }

    // Check confirm match
    if (password != confirmPassword) {
      return "Confirm password does not match";
    }

    return null; // Hợp lệ
  }
}
