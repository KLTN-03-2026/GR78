# openapi.api.PostsApi

## Load the API package
```dart
import 'package:openapi/api.dart';
```

All URIs are relative to *https://postmaxillary-variably-justa.ngrok-free.dev/api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**postControllerClosePost**](PostsApi.md#postcontrollerclosepost) | **PATCH** /posts/{id}/close | Close post
[**postControllerCreatePost**](PostsApi.md#postcontrollercreatepost) | **POST** /posts | Create new post
[**postControllerDeletePost**](PostsApi.md#postcontrollerdeletepost) | **DELETE** /posts/{id} | Delete post
[**postControllerGetFeed**](PostsApi.md#postcontrollergetfeed) | **GET** /posts/feed | Get public feed of open posts
[**postControllerGetMyPosts**](PostsApi.md#postcontrollergetmyposts) | **GET** /posts/my/posts | Get my posts
[**postControllerGetPostById**](PostsApi.md#postcontrollergetpostbyid) | **GET** /posts/{id} | Get post by ID
[**postControllerUpdatePost**](PostsApi.md#postcontrollerupdatepost) | **PATCH** /posts/{id} | Update post


# **postControllerClosePost**
> PostResponseDto postControllerClosePost(id)

Close post

Change post status to CLOSED. Only the post owner can close it.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getPostsApi();
final String id = id_example; // String | 

try {
    final response = api.postControllerClosePost(id);
    print(response);
} catch on DioException (e) {
    print('Exception when calling PostsApi->postControllerClosePost: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 

### Return type

[**PostResponseDto**](PostResponseDto.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **postControllerCreatePost**
> PostResponseDto postControllerCreatePost(createPostDto)

Create new post

Create a new service request post (Customer only)

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getPostsApi();
final CreatePostDto createPostDto = ; // CreatePostDto | 

try {
    final response = api.postControllerCreatePost(createPostDto);
    print(response);
} catch on DioException (e) {
    print('Exception when calling PostsApi->postControllerCreatePost: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **createPostDto** | [**CreatePostDto**](CreatePostDto.md)|  | 

### Return type

[**PostResponseDto**](PostResponseDto.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **postControllerDeletePost**
> DeletePostResponseDto postControllerDeletePost(id)

Delete post

Soft delete a post. Only the post owner can delete it.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getPostsApi();
final String id = id_example; // String | 

try {
    final response = api.postControllerDeletePost(id);
    print(response);
} catch on DioException (e) {
    print('Exception when calling PostsApi->postControllerDeletePost: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 

### Return type

[**DeletePostResponseDto**](DeletePostResponseDto.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **postControllerGetFeed**
> FeedResponseDto postControllerGetFeed(limit, cursor)

Get public feed of open posts

Retrieve paginated list of all open posts from customers. Uses cursor-based pagination for infinite scroll.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getPostsApi();
final num limit = 10; // num | Number of posts per page
final String cursor = 2025-11-13T10:00:00.000Z; // String | Cursor for pagination (ISO date)

try {
    final response = api.postControllerGetFeed(limit, cursor);
    print(response);
} catch on DioException (e) {
    print('Exception when calling PostsApi->postControllerGetFeed: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **limit** | **num**| Number of posts per page | [optional] 
 **cursor** | **String**| Cursor for pagination (ISO date) | [optional] 

### Return type

[**FeedResponseDto**](FeedResponseDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **postControllerGetMyPosts**
> FeedResponseDto postControllerGetMyPosts(limit, cursor)

Get my posts

Retrieve all posts created by the current customer

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getPostsApi();
final num limit = 10; // num | Number of posts per page
final String cursor = 2025-11-13T10:00:00.000Z; // String | Cursor for pagination (ISO date)

try {
    final response = api.postControllerGetMyPosts(limit, cursor);
    print(response);
} catch on DioException (e) {
    print('Exception when calling PostsApi->postControllerGetMyPosts: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **limit** | **num**| Number of posts per page | [optional] 
 **cursor** | **String**| Cursor for pagination (ISO date) | [optional] 

### Return type

[**FeedResponseDto**](FeedResponseDto.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **postControllerGetPostById**
> PostResponseDto postControllerGetPostById(id)

Get post by ID

Retrieve detailed information of a specific post

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getPostsApi();
final String id = id_example; // String | 

try {
    final response = api.postControllerGetPostById(id);
    print(response);
} catch on DioException (e) {
    print('Exception when calling PostsApi->postControllerGetPostById: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 

### Return type

[**PostResponseDto**](PostResponseDto.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **postControllerUpdatePost**
> PostResponseDto postControllerUpdatePost(id, updatePostDto)

Update post

Update an existing post. Only the post owner can update it.

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getPostsApi();
final String id = id_example; // String | 
final UpdatePostDto updatePostDto = ; // UpdatePostDto | 

try {
    final response = api.postControllerUpdatePost(id, updatePostDto);
    print(response);
} catch on DioException (e) {
    print('Exception when calling PostsApi->postControllerUpdatePost: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **updatePostDto** | [**UpdatePostDto**](UpdatePostDto.md)|  | 

### Return type

[**PostResponseDto**](PostResponseDto.md)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

