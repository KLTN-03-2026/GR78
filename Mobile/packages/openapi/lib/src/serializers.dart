//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_import

import 'package:one_of_serializer/any_of_serializer.dart';
import 'package:one_of_serializer/one_of_serializer.dart';
import 'package:built_collection/built_collection.dart';
import 'package:built_value/json_object.dart';
import 'package:built_value/serializer.dart';
import 'package:built_value/standard_json_plugin.dart';
import 'package:built_value/iso_8601_date_time_serializer.dart';
import 'package:openapi/src/date_serializer.dart';
import 'package:openapi/src/model/date.dart';

import 'package:openapi/src/model/change_display_name_dto.dart';
import 'package:openapi/src/model/create_post_dto.dart';
import 'package:openapi/src/model/create_quote_dto.dart';
import 'package:openapi/src/model/delete_account_response_dto.dart';
import 'package:openapi/src/model/delete_post_response_dto.dart';
import 'package:openapi/src/model/display_name_change_info_dto.dart';
import 'package:openapi/src/model/display_name_change_response_dto.dart';
import 'package:openapi/src/model/error_response_dto.dart';
import 'package:openapi/src/model/feed_response_dto.dart';
import 'package:openapi/src/model/login_dto.dart';
import 'package:openapi/src/model/login_mobile_dto.dart';
import 'package:openapi/src/model/login_response_data_dto.dart';
import 'package:openapi/src/model/login_response_dto.dart';
import 'package:openapi/src/model/post_response_dto.dart';
import 'package:openapi/src/model/post_response_dto_customer.dart';
import 'package:openapi/src/model/profile_list_response_dto.dart';
import 'package:openapi/src/model/profile_response_dto.dart';
import 'package:openapi/src/model/public_profile_response_dto.dart';
import 'package:openapi/src/model/register_dto.dart';
import 'package:openapi/src/model/register_response_data_dto.dart';
import 'package:openapi/src/model/register_response_dto.dart';
import 'package:openapi/src/model/reject_quote_dto.dart';
import 'package:openapi/src/model/update_avatar_dto.dart';
import 'package:openapi/src/model/update_contact_dto.dart';
import 'package:openapi/src/model/update_post_dto.dart';
import 'package:openapi/src/model/update_profile_dto.dart';
import 'package:openapi/src/model/update_quote_dto.dart';
import 'package:openapi/src/model/user_role.dart';

part 'serializers.g.dart';

@SerializersFor([
  ChangeDisplayNameDto,
  CreatePostDto,
  CreateQuoteDto,
  DeleteAccountResponseDto,
  DeletePostResponseDto,
  DisplayNameChangeInfoDto,
  DisplayNameChangeResponseDto,
  ErrorResponseDto,
  FeedResponseDto,
  LoginDto,
  LoginMobileDto,
  LoginResponseDataDto,
  LoginResponseDto,
  PostResponseDto,
  PostResponseDtoCustomer,
  ProfileListResponseDto,
  ProfileResponseDto,
  PublicProfileResponseDto,
  RegisterDto,
  RegisterResponseDataDto,
  RegisterResponseDto,
  RejectQuoteDto,
  UpdateAvatarDto,
  UpdateContactDto,
  UpdatePostDto,
  UpdateProfileDto,
  UpdateQuoteDto,
  UserRole,
])
Serializers serializers = (_$serializers.toBuilder()
      ..addBuilderFactory(
        const FullType(BuiltList, [FullType(String)]),
        () => ListBuilder<String>(),
      )
      ..add(const OneOfSerializer())
      ..add(const AnyOfSerializer())
      ..add(const DateSerializer())
      ..add(Iso8601DateTimeSerializer())
    ).build();

Serializers standardSerializers =
    (serializers.toBuilder()..addPlugin(StandardJsonPlugin())).build();
