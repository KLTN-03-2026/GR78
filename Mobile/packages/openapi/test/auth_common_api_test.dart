import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for AuthCommonApi
void main() {
  final instance = Openapi().getAuthCommonApi();

  group(AuthCommonApi, () {
    // Logout from all devices
    //
    // Sent body: bodyRefreshToken, Revoke all refresh tokens for the current user.
    //
    //Future authControllerLogoutAll() async
    test('test authControllerLogoutAll', () async {
      // TODO
    });

    // Register a new user
    //
    // Send body: RegisterDto
    //
    //Future<RegisterResponseDto> authControllerRegister(RegisterDto registerDto) async
    test('test authControllerRegister', () async {
      // TODO
    });

  });
}
