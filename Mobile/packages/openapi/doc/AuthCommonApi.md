# openapi.api.AuthCommonApi

## Load the API package
```dart
import 'package:openapi/api.dart';
```

All URIs are relative to *https://postmaxillary-variably-justa.ngrok-free.dev/api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**authControllerLogoutAll**](AuthCommonApi.md#authcontrollerlogoutall) | **POST** /auth/logout-all | Logout from all devices
[**authControllerRegister**](AuthCommonApi.md#authcontrollerregister) | **POST** /auth/register | Register a new user


# **authControllerLogoutAll**
> authControllerLogoutAll()

Logout from all devices

Sent body: bodyRefreshToken, Revoke all refresh tokens for the current user.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAuthCommonApi();

try {
    api.authControllerLogoutAll();
} catch on DioException (e) {
    print('Exception when calling AuthCommonApi->authControllerLogoutAll: $e\n');
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

# **authControllerRegister**
> RegisterResponseDto authControllerRegister(registerDto)

Register a new user

Send body: RegisterDto

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getAuthCommonApi();
final RegisterDto registerDto = ; // RegisterDto | 

try {
    final response = api.authControllerRegister(registerDto);
    print(response);
} catch on DioException (e) {
    print('Exception when calling AuthCommonApi->authControllerRegister: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **registerDto** | [**RegisterDto**](RegisterDto.md)|  | 

### Return type

[**RegisterResponseDto**](RegisterResponseDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

