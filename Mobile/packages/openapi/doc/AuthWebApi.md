# openapi.api.AuthWebApi

## Load the API package
```dart
import 'package:openapi/api.dart';
```

All URIs are relative to *https://postmaxillary-variably-justa.ngrok-free.dev/api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**authControllerLogin**](AuthWebApi.md#authcontrollerlogin) | **POST** /auth/login | Login (Web)
[**authControllerLogout**](AuthWebApi.md#authcontrollerlogout) | **POST** /auth/logout | Logout (Web)
[**authControllerRefresh**](AuthWebApi.md#authcontrollerrefresh) | **POST** /auth/refresh | Refresh access token (Web)


# **authControllerLogin**
> LoginResponseDto authControllerLogin(loginDto)

Login (Web)

Send body: LoginDto. Authenticate user via web browser. Refresh token stored in httpOnly cookie.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAuthWebApi();
final LoginDto loginDto = ; // LoginDto | 

try {
    final response = api.authControllerLogin(loginDto);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AuthWebApi->authControllerLogin: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **loginDto** | [**LoginDto**](LoginDto.md)|  | 

### Return type

[**LoginResponseDto**](LoginResponseDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerLogout**
> JsonObject authControllerLogout()

Logout (Web)

Do not send body, Do not send header, Sent cookie. Revoke refresh token and clear cookie

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAuthWebApi();

try {
    final response = api.authControllerLogout();
    print(response);
} catch on DioException (e) {
    print('Exception when calling AuthWebApi->authControllerLogout: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**JsonObject**](JsonObject.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerRefresh**
> authControllerRefresh()

Refresh access token (Web)

Do not send body, Do not send header, Sent cookie.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAuthWebApi();

try {
    api.authControllerRefresh();
} catch on DioException (e) {
    print('Exception when calling AuthWebApi->authControllerRefresh: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

