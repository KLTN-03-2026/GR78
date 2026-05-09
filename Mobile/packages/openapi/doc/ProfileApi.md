# openapi.api.ProfileApi

## Load the API package
```dart
import 'package:openapi/api.dart';
```

All URIs are relative to *https://postmaxillary-variably-justa.ngrok-free.dev/api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**profileControllerChangeDisplayName**](ProfileApi.md#profilecontrollerchangedisplayname) | **PUT** /profile/display-name | Change display name
[**profileControllerDeleteAccount**](ProfileApi.md#profilecontrollerdeleteaccount) | **DELETE** /profile/me | Delete account
[**profileControllerGetMyProfile**](ProfileApi.md#profilecontrollergetmyprofile) | **GET** /profile/me | Get my profile
[**profileControllerGetPublicProfile**](ProfileApi.md#profilecontrollergetpublicprofile) | **GET** /profile/user/{id} | Get public profile
[**profileControllerSearchProfiles**](ProfileApi.md#profilecontrollersearchprofiles) | **GET** /profile/search | Search profiles
[**profileControllerUpdateAvatar**](ProfileApi.md#profilecontrollerupdateavatar) | **PATCH** /profile/avatar | Update avatar
[**profileControllerUpdateContact**](ProfileApi.md#profilecontrollerupdatecontact) | **PUT** /profile/contact | Update contact information
[**profileControllerUpdateMyProfile**](ProfileApi.md#profilecontrollerupdatemyprofile) | **PATCH** /profile/me | Update my profile


# **profileControllerChangeDisplayName**
> DisplayNameChangeResponseDto profileControllerChangeDisplayName(changeDisplayNameDto)

Change display name

Change display name (restricted to once every 30 days)

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getProfileApi();
final ChangeDisplayNameDto changeDisplayNameDto = ; // ChangeDisplayNameDto | 

try {
    final response = api.profileControllerChangeDisplayName(changeDisplayNameDto);
    print(response);
} catch on DioException (e) {
    print('Exception when calling ProfileApi->profileControllerChangeDisplayName: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **changeDisplayNameDto** | [**ChangeDisplayNameDto**](ChangeDisplayNameDto.md)|  | 

### Return type

[**DisplayNameChangeResponseDto**](DisplayNameChangeResponseDto.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **profileControllerDeleteAccount**
> DeleteAccountResponseDto profileControllerDeleteAccount()

Delete account

Soft delete the authenticated user's account (can be recovered within 30 days)

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getProfileApi();

try {
    final response = api.profileControllerDeleteAccount();
    print(response);
} catch on DioException (e) {
    print('Exception when calling ProfileApi->profileControllerDeleteAccount: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**DeleteAccountResponseDto**](DeleteAccountResponseDto.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **profileControllerGetMyProfile**
> ProfileResponseDto profileControllerGetMyProfile()

Get my profile

Retrieve the authenticated user's complete profile information including private data

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getProfileApi();

try {
    final response = api.profileControllerGetMyProfile();
    print(response);
} catch on DioException (e) {
    print('Exception when calling ProfileApi->profileControllerGetMyProfile: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

[**ProfileResponseDto**](ProfileResponseDto.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **profileControllerGetPublicProfile**
> PublicProfileResponseDto profileControllerGetPublicProfile(id)

Get public profile

View public profile information of any user (limited data for privacy)

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getProfileApi();
final String id = uuid-123; // String | User UUID

try {
    final response = api.profileControllerGetPublicProfile(id);
    print(response);
} catch on DioException (e) {
    print('Exception when calling ProfileApi->profileControllerGetPublicProfile: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**| User UUID | 

### Return type

[**PublicProfileResponseDto**](PublicProfileResponseDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **profileControllerSearchProfiles**
> ProfileListResponseDto profileControllerSearchProfiles(searchTerm, limit, offset)

Search profiles

Search for users by display name (public endpoint for user discovery)

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getProfileApi();
final String searchTerm = John; // String | Search term for display name
final num limit = 20; // num | Maximum number of results
final num offset = 0; // num | Number of results to skip

try {
    final response = api.profileControllerSearchProfiles(searchTerm, limit, offset);
    print(response);
} catch on DioException (e) {
    print('Exception when calling ProfileApi->profileControllerSearchProfiles: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **searchTerm** | **String**| Search term for display name | [optional] 
 **limit** | **num**| Maximum number of results | [optional] [default to 20]
 **offset** | **num**| Number of results to skip | [optional] [default to 0]

### Return type

[**ProfileListResponseDto**](ProfileListResponseDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **profileControllerUpdateAvatar**
> ProfileResponseDto profileControllerUpdateAvatar(updateAvatarDto)

Update avatar

Update user avatar URL (must be a valid URL)

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getProfileApi();
final UpdateAvatarDto updateAvatarDto = ; // UpdateAvatarDto | 

try {
    final response = api.profileControllerUpdateAvatar(updateAvatarDto);
    print(response);
} catch on DioException (e) {
    print('Exception when calling ProfileApi->profileControllerUpdateAvatar: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **updateAvatarDto** | [**UpdateAvatarDto**](UpdateAvatarDto.md)|  | 

### Return type

[**ProfileResponseDto**](ProfileResponseDto.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **profileControllerUpdateContact**
> ProfileResponseDto profileControllerUpdateContact(updateContactDto)

Update contact information

Update email and/or phone number with uniqueness validation

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getProfileApi();
final UpdateContactDto updateContactDto = ; // UpdateContactDto | 

try {
    final response = api.profileControllerUpdateContact(updateContactDto);
    print(response);
} catch on DioException (e) {
    print('Exception when calling ProfileApi->profileControllerUpdateContact: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **updateContactDto** | [**UpdateContactDto**](UpdateContactDto.md)|  | 

### Return type

[**ProfileResponseDto**](ProfileResponseDto.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **profileControllerUpdateMyProfile**
> ProfileResponseDto profileControllerUpdateMyProfile(updateProfileDto)

Update my profile

Update profile information (excluding display name and contact info - use dedicated endpoints)

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getProfileApi();
final UpdateProfileDto updateProfileDto = ; // UpdateProfileDto | 

try {
    final response = api.profileControllerUpdateMyProfile(updateProfileDto);
    print(response);
} catch on DioException (e) {
    print('Exception when calling ProfileApi->profileControllerUpdateMyProfile: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **updateProfileDto** | [**UpdateProfileDto**](UpdateProfileDto.md)|  | 

### Return type

[**ProfileResponseDto**](ProfileResponseDto.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

