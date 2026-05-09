import 'package:get/get.dart';
import 'package:mobile_app_doan/features/auth/controllers/auth_controller.dart';
import 'package:mobile_app_doan/home/controllers/user_controller.dart';
import 'package:openapi/openapi.dart';

/// Role helpers aligned with backend `UserRole` (`customer` | `provider` | `admin`).
/// Prefers [ProfileController] when loaded, otherwise cached [AuthController.userRole].
bool currentUserIsProvider() {
  if (Get.isRegistered<ProfileController>()) {
    final r = Get.find<ProfileController>().profile.value?.role;
    if (r != null) return r == ProfileResponseDtoRoleEnum.provider;
  }
  if (Get.isRegistered<AuthController>()) {
    return Get.find<AuthController>().userRole.value.toLowerCase() == 'provider';
  }
  return false;
}

bool currentUserIsCustomer() {
  if (Get.isRegistered<ProfileController>()) {
    final r = Get.find<ProfileController>().profile.value?.role;
    if (r != null) return r == ProfileResponseDtoRoleEnum.customer;
  }
  if (Get.isRegistered<AuthController>()) {
    return Get.find<AuthController>().userRole.value.toLowerCase() == 'customer';
  }
  return false;
}

bool currentUserIsAdmin() {
  if (Get.isRegistered<ProfileController>()) {
    final r = Get.find<ProfileController>().profile.value?.role;
    if (r != null) return r == ProfileResponseDtoRoleEnum.admin;
  }
  if (Get.isRegistered<AuthController>()) {
    return Get.find<AuthController>().userRole.value.toLowerCase() == 'admin';
  }
  return false;
}
