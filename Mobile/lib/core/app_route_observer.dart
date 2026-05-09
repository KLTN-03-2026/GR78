import 'package:flutter/material.dart';

/// Gắn vào [GetMaterialApp.navigatorObservers] để [RouteAware] nhận [didPopNext]
/// khi pop khỏi các route chồng lên `/home` (vd. Bài đã lưu).
final RouteObserver<ModalRoute<void>> appRouteObserver =
    RouteObserver<ModalRoute<void>>();
