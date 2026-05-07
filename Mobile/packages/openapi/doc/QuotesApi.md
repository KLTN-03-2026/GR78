# openapi.api.QuotesApi

## Load the API package
```dart
import 'package:openapi/api.dart';
```

All URIs are relative to *https://postmaxillary-variably-justa.ngrok-free.dev/api/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**quoteControllerAcceptQuote**](QuotesApi.md#quotecontrolleracceptquote) | **POST** /quotes/{id}/accept | Accepted quote (Customer)
[**quoteControllerCancelQuote**](QuotesApi.md#quotecontrollercancelquote) | **POST** /quotes/{id}/cancel | Cancel quote (Worker)
[**quoteControllerCreateQuote**](QuotesApi.md#quotecontrollercreatequote) | **POST** /quotes | Create new quote (Worker)
[**quoteControllerDeleteQuote**](QuotesApi.md#quotecontrollerdeletequote) | **DELETE** /quotes/{id} | Delete quote (Worker)
[**quoteControllerGetMyQuotes**](QuotesApi.md#quotecontrollergetmyquotes) | **GET** /quotes/my-quotes | Get my quote list (Worker)
[**quoteControllerGetPostQuotes**](QuotesApi.md#quotecontrollergetpostquotes) | **GET** /quotes/post/{postId} | Get post bids (Customer)
[**quoteControllerGetQuoteById**](QuotesApi.md#quotecontrollergetquotebyid) | **GET** /quotes/{id} | See detailed quote
[**quoteControllerRejectQuote**](QuotesApi.md#quotecontrollerrejectquote) | **POST** /quotes/{id}/reject | Refused to bid (Customer)
[**quoteControllerUpdateQuote**](QuotesApi.md#quotecontrollerupdatequote) | **PUT** /quotes/{id} | Update price quote (Worker)


# **quoteControllerAcceptQuote**
> quoteControllerAcceptQuote(id)

Accepted quote (Customer)

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getQuotesApi();
final String id = id_example; // String | 

try {
    api.quoteControllerAcceptQuote(id);
} catch on DioException (e) {
    print('Exception when calling QuotesApi->quoteControllerAcceptQuote: $e\n');
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

# **quoteControllerCancelQuote**
> quoteControllerCancelQuote(id)

Cancel quote (Worker)

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getQuotesApi();
final String id = id_example; // String | 

try {
    api.quoteControllerCancelQuote(id);
} catch on DioException (e) {
    print('Exception when calling QuotesApi->quoteControllerCancelQuote: $e\n');
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

# **quoteControllerCreateQuote**
> quoteControllerCreateQuote(createQuoteDto)

Create new quote (Worker)

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getQuotesApi();
final CreateQuoteDto createQuoteDto = ; // CreateQuoteDto | 

try {
    api.quoteControllerCreateQuote(createQuoteDto);
} catch on DioException (e) {
    print('Exception when calling QuotesApi->quoteControllerCreateQuote: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **createQuoteDto** | [**CreateQuoteDto**](CreateQuoteDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **quoteControllerDeleteQuote**
> quoteControllerDeleteQuote(id)

Delete quote (Worker)

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getQuotesApi();
final String id = id_example; // String | 

try {
    api.quoteControllerDeleteQuote(id);
} catch on DioException (e) {
    print('Exception when calling QuotesApi->quoteControllerDeleteQuote: $e\n');
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

# **quoteControllerGetMyQuotes**
> quoteControllerGetMyQuotes(postId, price, description, terms, estimatedDuration, imageUrls, status)

Get my quote list (Worker)

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getQuotesApi();
final String postId = postId_example; // String | ID post
final num price = 500000; // num | the price of a quote 
final String description = description_example; // String | Detailed description quote
final String terms = terms_example; // String | Terms and conditions
final num estimatedDuration = 120; // num | Estimated time (minutes)
final BuiltList<String> imageUrls = ; // BuiltList<String> | List of image URLs
final String status = cancelled; // String | Post status

try {
    api.quoteControllerGetMyQuotes(postId, price, description, terms, estimatedDuration, imageUrls, status);
} catch on DioException (e) {
    print('Exception when calling QuotesApi->quoteControllerGetMyQuotes: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **postId** | **String**| ID post | [optional] 
 **price** | **num**| the price of a quote  | [optional] 
 **description** | **String**| Detailed description quote | [optional] 
 **terms** | **String**| Terms and conditions | [optional] 
 **estimatedDuration** | **num**| Estimated time (minutes) | [optional] 
 **imageUrls** | [**BuiltList&lt;String&gt;**](String.md)| List of image URLs | [optional] 
 **status** | **String**| Post status | [optional] 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **quoteControllerGetPostQuotes**
> quoteControllerGetPostQuotes(postId)

Get post bids (Customer)

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getQuotesApi();
final String postId = postId_example; // String | 

try {
    api.quoteControllerGetPostQuotes(postId);
} catch on DioException (e) {
    print('Exception when calling QuotesApi->quoteControllerGetPostQuotes: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **postId** | **String**|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **quoteControllerGetQuoteById**
> quoteControllerGetQuoteById(id)

See detailed quote

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getQuotesApi();
final String id = id_example; // String | 

try {
    api.quoteControllerGetQuoteById(id);
} catch on DioException (e) {
    print('Exception when calling QuotesApi->quoteControllerGetQuoteById: $e\n');
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

# **quoteControllerRejectQuote**
> quoteControllerRejectQuote(id, rejectQuoteDto)

Refused to bid (Customer)

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getQuotesApi();
final String id = id_example; // String | 
final RejectQuoteDto rejectQuoteDto = ; // RejectQuoteDto | 

try {
    api.quoteControllerRejectQuote(id, rejectQuoteDto);
} catch on DioException (e) {
    print('Exception when calling QuotesApi->quoteControllerRejectQuote: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **rejectQuoteDto** | [**RejectQuoteDto**](RejectQuoteDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **quoteControllerUpdateQuote**
> quoteControllerUpdateQuote(id, updateQuoteDto)

Update price quote (Worker)

### Example
```dart
import 'package:openapi/api.dart';

final api = Openapi().getQuotesApi();
final String id = id_example; // String | 
final UpdateQuoteDto updateQuoteDto = ; // UpdateQuoteDto | 

try {
    api.quoteControllerUpdateQuote(id, updateQuoteDto);
} catch on DioException (e) {
    print('Exception when calling QuotesApi->quoteControllerUpdateQuote: $e\n');
}
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **id** | **String**|  | 
 **updateQuoteDto** | [**UpdateQuoteDto**](UpdateQuoteDto.md)|  | 

### Return type

void (empty response body)

### Authorization

[bearer](../README.md#bearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

