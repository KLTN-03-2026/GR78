import 'package:get/get.dart';

bool _offAllLoginPending = false;

bool _navigatorAttached() {
  final key = Get.key;
  return key.currentState != null && key.currentContext != null;
}

/// Clears the stack and shows login. If the navigator is not mounted yet (e.g. 401
/// during [main] before [runApp]), the navigation is deferred until [flushPendingOffAllToLogin].
void scheduleOffAllToLogin() {
  if (_navigatorAttached()) {
    _offAllLoginPending = false;
    Get.offAllNamed('/login');
  } else {
    _offAllLoginPending = true;
  }
}

/// Call once from the root app after the first frame so deferred logout navigation runs.
void flushPendingOffAllToLogin() {
  if (_offAllLoginPending && _navigatorAttached()) {
    _offAllLoginPending = false;
    Get.offAllNamed('/login');
  }
}
