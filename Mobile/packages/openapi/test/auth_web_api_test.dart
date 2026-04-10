import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for AuthWebApi
void main() {
  final instance = Openapi().getAuthWebApi();

  group(AuthWebApi, () {
    // Login (Web)
    //
    // Send body: LoginDto. Authenticate user via web browser. Refresh token stored in httpOnly cookie.
    //
    //Future<LoginResponseDto> authControllerLogin(LoginDto loginDto) async
    test('test authControllerLogin', () async {
      // TODO
    });

    // Logout (Web)
    //
    // Do not send body, Do not send header, Sent cookie. Revoke refresh token and clear cookie
    //
    //Future<JsonObject> authControllerLogout() async
    test('test authControllerLogout', () async {
      // TODO
    });

    // Refresh access token (Web)
    //
    // Do not send body, Do not send header, Sent cookie.
    //
    //Future authControllerRefresh() async
    test('test authControllerRefresh', () async {
      // TODO
    });

  });
}
