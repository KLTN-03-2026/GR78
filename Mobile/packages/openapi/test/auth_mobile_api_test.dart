import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for AuthMobileApi
void main() {
  final instance = Openapi().getAuthMobileApi();

  group(AuthMobileApi, () {
    // Login (Mobile)
    //
    // Sent body: LoginMobileDto, Sent header X-Device-ID mobile
    //
    //Future<LoginResponseDto> authControllerLoginMobile(String xDeviceID, LoginMobileDto loginMobileDto) async
    test('test authControllerLoginMobile', () async {
      // TODO
    });

    // Logout specific device (Mobile)
    //
    // Sent body: refreshToken, Sent header X-Device-ID mobile. Revoke all tokens for a specific device.
    //
    //Future authControllerLogoutDevice(String xDeviceID) async
    test('test authControllerLogoutDevice', () async {
      // TODO
    });

    // Logout (Mobile)
    //
    // Sent body: RefreshTokenDto, Sent header X-Device-ID mobile. Revoke refresh token for specific device.
    //
    //Future authControllerLogoutMobile(String xDeviceID) async
    test('test authControllerLogoutMobile', () async {
      // TODO
    });

    // Refresh access token (Mobile)
    //
    // Sent body: RefreshTokenDto, Sent header X-Device-ID mobile.
    //
    //Future<JsonObject> authControllerRefreshMobile(String xDeviceID) async
    test('test authControllerRefreshMobile', () async {
      // TODO
    });

  });
}
