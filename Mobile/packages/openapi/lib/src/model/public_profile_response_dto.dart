//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'public_profile_response_dto.g.dart';

/// PublicProfileResponseDto
///
/// Properties:
/// * [id] - User unique identifier
/// * [role] - User role
/// * [displayName] - Public display name
/// * [avatarUrl] - Avatar image URL
/// * [bio] - User biography
/// * [isVerified] - Verification badge status
/// * [memberSince] - Member since date
@BuiltValue()
abstract class PublicProfileResponseDto implements Built<PublicProfileResponseDto, PublicProfileResponseDtoBuilder> {
  /// User unique identifier
  @BuiltValueField(wireName: r'id')
  String get id;

  /// User role
  @BuiltValueField(wireName: r'role')
  PublicProfileResponseDtoRoleEnum get role;
  // enum roleEnum {  customer,  provider,  admin,  };

  /// Public display name
  @BuiltValueField(wireName: r'displayName')
  String? get displayName;

  /// Avatar image URL
  @BuiltValueField(wireName: r'avatarUrl')
  String? get avatarUrl;

  /// User biography
  @BuiltValueField(wireName: r'bio')
  String? get bio;

  /// Verification badge status
  @BuiltValueField(wireName: r'isVerified')
  bool get isVerified;

  /// Member since date
  @BuiltValueField(wireName: r'memberSince')
  DateTime get memberSince;

  PublicProfileResponseDto._();

  factory PublicProfileResponseDto([void updates(PublicProfileResponseDtoBuilder b)]) = _$PublicProfileResponseDto;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PublicProfileResponseDtoBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PublicProfileResponseDto> get serializer => _$PublicProfileResponseDtoSerializer();
}

class _$PublicProfileResponseDtoSerializer implements PrimitiveSerializer<PublicProfileResponseDto> {
  @override
  final Iterable<Type> types = const [PublicProfileResponseDto, _$PublicProfileResponseDto];

  @override
  final String wireName = r'PublicProfileResponseDto';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PublicProfileResponseDto object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'role';
    yield serializers.serialize(
      object.role,
      specifiedType: const FullType(PublicProfileResponseDtoRoleEnum),
    );
    if (object.displayName != null) {
      yield r'displayName';
      yield serializers.serialize(
        object.displayName,
        specifiedType: const FullType(String),
      );
    }
    if (object.avatarUrl != null) {
      yield r'avatarUrl';
      yield serializers.serialize(
        object.avatarUrl,
        specifiedType: const FullType(String),
      );
    }
    if (object.bio != null) {
      yield r'bio';
      yield serializers.serialize(
        object.bio,
        specifiedType: const FullType(String),
      );
    }
    yield r'isVerified';
    yield serializers.serialize(
      object.isVerified,
      specifiedType: const FullType(bool),
    );
    yield r'memberSince';
    yield serializers.serialize(
      object.memberSince,
      specifiedType: const FullType(DateTime),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PublicProfileResponseDto object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PublicProfileResponseDtoBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.id = valueDes;
          break;
        case r'role':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PublicProfileResponseDtoRoleEnum),
          ) as PublicProfileResponseDtoRoleEnum;
          result.role = valueDes;
          break;
        case r'displayName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.displayName = valueDes;
          break;
        case r'avatarUrl':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.avatarUrl = valueDes;
          break;
        case r'bio':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.bio = valueDes;
          break;
        case r'isVerified':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.isVerified = valueDes;
          break;
        case r'memberSince':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.memberSince = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PublicProfileResponseDto deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PublicProfileResponseDtoBuilder();
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

class PublicProfileResponseDtoRoleEnum extends EnumClass {

  /// User role
  @BuiltValueEnumConst(wireName: r'customer')
  static const PublicProfileResponseDtoRoleEnum customer = _$publicProfileResponseDtoRoleEnum_customer;
  /// User role
  @BuiltValueEnumConst(wireName: r'provider')
  static const PublicProfileResponseDtoRoleEnum provider = _$publicProfileResponseDtoRoleEnum_provider;
  /// User role
  @BuiltValueEnumConst(wireName: r'admin')
  static const PublicProfileResponseDtoRoleEnum admin = _$publicProfileResponseDtoRoleEnum_admin;

  static Serializer<PublicProfileResponseDtoRoleEnum> get serializer => _$publicProfileResponseDtoRoleEnumSerializer;

  const PublicProfileResponseDtoRoleEnum._(String name): super(name);

  static BuiltSet<PublicProfileResponseDtoRoleEnum> get values => _$publicProfileResponseDtoRoleEnumValues;
  static PublicProfileResponseDtoRoleEnum valueOf(String name) => _$publicProfileResponseDtoRoleEnumValueOf(name);
}

