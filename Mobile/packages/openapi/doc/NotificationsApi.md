# openapi.api.NotificationsApi

## Load the API package
```dart
import 'package:openapi/api.dart';
```

All URIs are relative to *https://postmaxillary-variably-justa.ngrok-free.dev/api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**notificationControllerDeleteNotification**](NotificationsApi.md#notificationcontrollerdeletenotification) | **DELETE** /notifications/{id} | delete notification
[**notificationControllerDeleteReadNotifications**](NotificationsApi.md#notificationcontrollerdeletereadnotifications) | **DELETE** /notifications/read | delete all read receipts
[**notificationControllerGetNotifications**](NotificationsApi.md#notificationcontrollergetnotifications) | **GET** /notifications | get successful list
[**notificationControllerGetUnreadCount**](NotificationsApi.md#notificationcontrollergetunreadcount) | **GET** /notifications/unread-count | count unread notifications
[**notificationControllerMarkAllAsRead**](NotificationsApi.md#notificationcontrollermarkallasread) | **POST** /notifications/mark-all-read | mark all read
[**notificationControllerMarkAsRead**](NotificationsApi.md#notificationcontrollermarkasread) | **POST** /notifications/{id}/read | mark as read


# **notificationControllerDeleteNotification**
> notificationControllerDeleteNotification(id)

delete notification

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getNotificationsApi();
final String id = id_example; // String | 

try {
    api.notificationControllerDeleteNotification(id);
} catch on DioException (e) {
    print('Exception when calling NotificationsApi->notificationControllerDeleteNotification: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **notificationControllerDeleteReadNotifications**
> notificationControllerDeleteReadNotifications()

delete all read receipts

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getNotificationsApi();

try {
    api.notificationControllerDeleteReadNotifications();
} catch on DioException (e) {
    print('Exception when calling NotificationsApi->notificationControllerDeleteReadNotifications: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **notificationControllerGetNotifications**
> notificationControllerGetNotifications(page, limit, unreadOnly)

get successful list

get list of successful notifications

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getNotificationsApi();
final num page = 8.14; // num | Number of pages
final num limit = 8.14; // num | Quantity/page
final bool unreadOnly = true; // bool | Only take unread

try {
    api.notificationControllerGetNotifications(page, limit, unreadOnly);
} catch on DioException (e) {
    print('Exception when calling NotificationsApi->notificationControllerGetNotifications: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **page** | **num**| Number of pages | [optional] [default to 1]
 **limit** | **num**| Quantity/page | [optional] [default to 20]
 **unreadOnly** | **bool**| Only take unread | [optional] [default to false]

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **notificationControllerGetUnreadCount**
> notificationControllerGetUnreadCount()

count unread notifications

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getNotificationsApi();

try {
    api.notificationControllerGetUnreadCount();
} catch on DioException (e) {
    print('Exception when calling NotificationsApi->notificationControllerGetUnreadCount: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **notificationControllerMarkAllAsRead**
> notificationControllerMarkAllAsRead()

mark all read

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getNotificationsApi();

try {
    api.notificationControllerMarkAllAsRead();
} catch on DioException (e) {
    print('Exception when calling NotificationsApi->notificationControllerMarkAllAsRead: $e\n');
}
```

### Parameters
This endpoint does not need any parameter.

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **notificationControllerMarkAsRead**
> notificationControllerMarkAsRead(id)

mark as read

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getNotificationsApi();
final String id = id_example; // String | 

try {
    api.notificationControllerMarkAsRead(id);
} catch on DioException (e) {
    print('Exception when calling NotificationsApi->notificationControllerMarkAsRead: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

