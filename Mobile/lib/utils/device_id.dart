import 'dart:io';
import 'package:device_info_plus/device_info_plus.dart';

class DeviceInfoHelper {
  static final DeviceInfoPlugin _deviceInfo = DeviceInfoPlugin();

  static Future<String> getDeviceDetails() async {
    String deviceId = 'unknown';

    try {
      if (Platform.isAndroid) {
        AndroidDeviceInfo androidInfo = await _deviceInfo.androidInfo;
        deviceId = androidInfo.id; // Unique ID on Android
      } else if (Platform.isIOS) {
        IosDeviceInfo iosInfo = await _deviceInfo.iosInfo;
        deviceId = iosInfo.identifierForVendor ?? 'unknown'; // Unique ID on iOS
      }
    } catch (e) {
      print('Error getting device info: $e');
    }

    return deviceId;
  }
}
