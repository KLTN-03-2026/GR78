import 'package:get/get.dart';

/// Cho phép dialog / bottom sheet gọi chuyển tab trên [MobileHomeScreen].
class MobileShellController extends GetxController {
  void Function(int index)? _setTab;

  void bind(void Function(int index) setTab) {
    _setTab = setTab;
  }

  void unbind() {
    _setTab = null;
  }

  void goToTab(int index) {
    _setTab?.call(index);
  }
}
