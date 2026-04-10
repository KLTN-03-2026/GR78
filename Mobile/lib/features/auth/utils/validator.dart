class Validators {
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
