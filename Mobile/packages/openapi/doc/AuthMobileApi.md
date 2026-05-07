# openapi.api.AuthMobileApi

## Load the API package
```dart
import 'package:openapi/api.dart';
```

All URIs are relative to *https://postmaxillary-variably-justa.ngrok-free.dev/api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**authControllerLoginMobile**](AuthMobileApi.md#authcontrollerloginmobile) | **POST** /auth/login-mobile | Login (Mobile)
[**authControllerLogoutDevice**](AuthMobileApi.md#authcontrollerlogoutdevice) | **POST** /auth/logout-device | Logout specific device (Mobile)
[**authControllerLogoutMobile**](AuthMobileApi.md#authcontrollerlogoutmobile) | **POST** /auth/logout-mobile | Logout (Mobile)
[**authControllerRefreshMobile**](AuthMobileApi.md#authcontrollerrefreshmobile) | **POST** /auth/refresh-mobile | Refresh access token (Mobile)


# **authControllerLoginMobile**
> LoginResponseDto authControllerLoginMobile(xDeviceID, loginMobileDto)

Login (Mobile)

Sent body: LoginMobileDto, Sent header X-Device-ID mobile

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAuthMobileApi();
final String xDeviceID = xDeviceID_example; // String | Unique device identifier (UUID recommended)
final LoginMobileDto loginMobileDto = ; // LoginMobileDto | 

try {
    final response = api.authControllerLoginMobile(xDeviceID, loginMobileDto);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AuthMobileApi->authControllerLoginMobile: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xDeviceID** | **String**| Unique device identifier (UUID recommended) | 
 **loginMobileDto** | [**LoginMobileDto**](LoginMobileDto.md)|  | 

### Return type

[**LoginResponseDto**](LoginResponseDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerLogoutDevice**
> authControllerLogoutDevice(xDeviceID)

Logout specific device (Mobile)

Sent body: refreshToken, Sent header X-Device-ID mobile. Revoke all tokens for a specific device.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAuthMobileApi();
final String xDeviceID = xDeviceID_example; // String | Device identifier to logout

try {
    api.authControllerLogoutDevice(xDeviceID);
} catch on DioException (e) {
    print('Exception when calling AuthMobileApi->authControllerLogoutDevice: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xDeviceID** | **String**| Device identifier to logout | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerLogoutMobile**
> authControllerLogoutMobile(xDeviceID)

Logout (Mobile)

Sent body: RefreshTokenDto, Sent header X-Device-ID mobile. Revoke refresh token for specific device.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAuthMobileApi();
final String xDeviceID = xDeviceID_example; // String | Unique device identifier

try {
    api.authControllerLogoutMobile(xDeviceID);
} catch on DioException (e) {
    print('Exception when calling AuthMobileApi->authControllerLogoutMobile: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xDeviceID** | **String**| Unique device identifier | 

### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **authControllerRefreshMobile**
> JsonObject authControllerRefreshMobile(xDeviceID)

Refresh access token (Mobile)

Sent body: RefreshTokenDto, Sent header X-Device-ID mobile.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAuthMobileApi();
final String xDeviceID = xDeviceID_example; // String | Unique device identifier

try {
    final response = api.authControllerRefreshMobile(xDeviceID);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AuthMobileApi->authControllerRefreshMobile: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **xDeviceID** | **String**| Unique device identifier | 

### Return type

[**JsonObject**](JsonObject.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

