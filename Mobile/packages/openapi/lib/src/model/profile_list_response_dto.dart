//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/public_profile_response_dto.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'profile_list_response_dto.g.dart';

/// ProfileListResponseDto
///
/// Properties:
/// * [profiles] - List of profiles
/// * [total] - Total number of profiles matching query
/// * [count] - Number of results returned
@BuiltValue()
abstract class ProfileListResponseDto implements Built<ProfileListResponseDto, ProfileListResponseDtoBuilder> {
  /// List of profiles
  @BuiltValueField(wireName: r'profiles')
  BuiltList<PublicProfileResponseDto> get profiles;

  /// Total number of profiles matching query
  @BuiltValueField(wireName: r'total')
  num get total;

  /// Number of results returned
  @BuiltValueField(wireName: r'count')
  num get count;

  ProfileListResponseDto._();

  factory ProfileListResponseDto([void updates(ProfileListResponseDtoBuilder b)]) = _$ProfileListResponseDto;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ProfileListResponseDtoBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ProfileListResponseDto> get serializer => _$ProfileListResponseDtoSerializer();
}

class _$ProfileListResponseDtoSerializer implements PrimitiveSerializer<ProfileListResponseDto> {
  @override
  final Iterable<Type> types = const [ProfileListResponseDto, _$ProfileListResponseDto];

  @override
  final String wireName = r'ProfileListResponseDto';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ProfileListResponseDto object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'profiles';
    yield serializers.serialize(
      object.profiles,
      specifiedType: const FullType(BuiltList, [FullType(PublicProfileResponseDto)]),
    );
    yield r'total';
    yield serializers.serialize(
      object.total,
      specifiedType: const FullType(num),
    );
    yield r'count';
    yield serializers.serialize(
      object.count,
      specifiedType: const FullType(num),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    ProfileListResponseDto object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ProfileListResponseDtoBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'profiles':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(PublicProfileResponseDto)]),
          ) as BuiltList<PublicProfileResponseDto>;
          result.profiles.replace(valueDes);
          break;
        case r'total':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(num),
          ) as num;
          result.total = valueDes;
          break;
        case r'count':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(num),
          ) as num;
          result.count = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  ProfileListResponseDto deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ProfileListResponseDtoBuilder();
    final serializedList = (serialized as Iterable<Object?>).toList();
    final unhandled = <Object?>[];
    _deserializeProperties(
      serializers,
      serialized,
      specifiedType: specifiedType,
      serializedList: serializedList,
      unhandled: unhandled,
      result: result,
    );
    return result.build();
  }
}

