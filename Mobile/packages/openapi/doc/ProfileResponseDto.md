# openapi.model.ProfileResponseDto

## Load the model package
```dart
import 'package:openapi/api.dart';
```

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **String** | User unique identifier | 
**email** | **String** | Email address | [optional] 
**phone** | **String** | Phone number | [optional] 
**role** | **String** | User role | 
**fullName** | **String** | Full legal name | [optional] 
**displayName** | **String** | Public display name | [optional] 
**avatarUrl** | **String** | Avatar image URL | [optional] 
**bio** | **String** | User biography | [optional] 
**address** | **String** | Physical address | [optional] 
**birthday** | [**DateTime**](DateTime.md) | Date of birth | [optional] 
**gender** | **String** | Gender | [optional] 
**isVerified** | **bool** | Email/phone verification status | 
**isActive** | **bool** | Account active status | 
**displayNameChangeInfo** | [**DisplayNameChangeInfoDto**](DisplayNameChangeInfoDto.md) | Display name change information | 
**createdAt** | [**DateTime**](DateTime.md) | Account creation timestamp | 
**updatedAt** | [**DateTime**](DateTime.md) | Last profile update timestamp | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


