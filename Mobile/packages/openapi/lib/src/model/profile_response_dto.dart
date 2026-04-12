//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/display_name_change_info_dto.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'profile_response_dto.g.dart';

/// ProfileResponseDto
///
/// Properties:
/// * [id] - User unique identifier
/// * [email] - Email address
/// * [phone] - Phone number
/// * [role] - User role
/// * [fullName] - Full legal name
/// * [displayName] - Public display name
/// * [avatarUrl] - Avatar image URL
/// * [bio] - User biography
/// * [address] - Physical address
/// * [birthday] - Date of birth
/// * [gender] - Gender
/// * [isVerified] - Email/phone verification status
/// * [isActive] - Account active status
/// * [displayNameChangeInfo] - Display name change information
/// * [createdAt] - Account creation timestamp
/// * [updatedAt] - Last profile update timestamp
@BuiltValue()
abstract class ProfileResponseDto implements Built<ProfileResponseDto, ProfileResponseDtoBuilder> {
  /// User unique identifier
  @BuiltValueField(wireName: r'id')
  String get id;

  /// Email address
  @BuiltValueField(wireName: r'email')
  String? get email;

  /// Phone number
  @BuiltValueField(wireName: r'phone')
  String? get phone;

  /// User role
  @BuiltValueField(wireName: r'role')
  ProfileResponseDtoRoleEnum get role;
  // enum roleEnum {  customer,  provider,  admin,  };

  /// Full legal name
  @BuiltValueField(wireName: r'fullName')
  String? get fullName;

  /// Public display name
  @BuiltValueField(wireName: r'displayName')
  String? get displayName;

  /// Avatar image URL
  @BuiltValueField(wireName: r'avatarUrl')
  String? get avatarUrl;

  /// User biography
  @BuiltValueField(wireName: r'bio')
  String? get bio;

  /// Physical address
  @BuiltValueField(wireName: r'address')
  String? get address;

  /// Date of birth
  @BuiltValueField(wireName: r'birthday')
  DateTime? get birthday;

  /// Gender
  @BuiltValueField(wireName: r'gender')
  ProfileResponseDtoGenderEnum? get gender;
  // enum genderEnum {  male,  female,  other,  };

  /// Email/phone verification status
  @BuiltValueField(wireName: r'isVerified')
  bool get isVerified;

  /// Account active status
  @BuiltValueField(wireName: r'isActive')
  bool get isActive;

  /// Display name change information
  @BuiltValueField(wireName: r'displayNameChangeInfo')
  DisplayNameChangeInfoDto get displayNameChangeInfo;

  /// Account creation timestamp
  @BuiltValueField(wireName: r'createdAt')
  DateTime get createdAt;

  /// Last profile update timestamp
  @BuiltValueField(wireName: r'updatedAt')
  DateTime get updatedAt;

  ProfileResponseDto._();

  factory ProfileResponseDto([void updates(ProfileResponseDtoBuilder b)]) = _$ProfileResponseDto;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ProfileResponseDtoBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ProfileResponseDto> get serializer => _$ProfileResponseDtoSerializer();
}

class _$ProfileResponseDtoSerializer implements PrimitiveSerializer<ProfileResponseDto> {
  @override
  final Iterable<Type> types = const [ProfileResponseDto, _$ProfileResponseDto];

  @override
  final String wireName = r'ProfileResponseDto';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ProfileResponseDto object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    if (object.email != null) {
      yield r'email';
      yield serializers.serialize(
        object.email,
        specifiedType: const FullType(String),
      );
    }
    if (object.phone != null) {
      yield r'phone';
      yield serializers.serialize(
        object.phone,
        specifiedType: const FullType(String),
      );
    }
    yield r'role';
    yield serializers.serialize(
      object.role,
      specifiedType: const FullType(ProfileResponseDtoRoleEnum),
    );
    if (object.fullName != null) {
      yield r'fullName';
      yield serializers.serialize(
        object.fullName,
        specifiedType: const FullType(String),
      );
    }
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
    if (object.address != null) {
      yield r'address';
      yield serializers.serialize(
        object.address,
        specifiedType: const FullType(String),
      );
    }
    if (object.birthday != null) {
      yield r'birthday';
      yield serializers.serialize(
        object.birthday,
        specifiedType: const FullType(DateTime),
      );
    }
    if (object.gender != null) {
      yield r'gender';
      yield serializers.serialize(
        object.gender,
        specifiedType: const FullType(ProfileResponseDtoGenderEnum),
      );
    }
    yield r'isVerified';
    yield serializers.serialize(
      object.isVerified,
      specifiedType: const FullType(bool),
    );
    yield r'isActive';
    yield serializers.serialize(
      object.isActive,
      specifiedType: const FullType(bool),
    );
    yield r'displayNameChangeInfo';
    yield serializers.serialize(
      object.displayNameChangeInfo,
      specifiedType: const FullType(DisplayNameChangeInfoDto),
    );
    yield r'createdAt';
    yield serializers.serialize(
      object.createdAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'updatedAt';
    yield serializers.serialize(
      object.updatedAt,
      specifiedType: const FullType(DateTime),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    ProfileResponseDto object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ProfileResponseDtoBuilder result,
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
        case r'email':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.email = valueDes;
          break;
        case r'phone':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.phone = valueDes;
          break;
        case r'role':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(ProfileResponseDtoRoleEnum),
          ) as ProfileResponseDtoRoleEnum;
          result.role = valueDes;
          break;
        case r'fullName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.fullName = valueDes;
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
        case r'address':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.address = valueDes;
          break;
        case r'birthday':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.birthday = valueDes;
          break;
        case r'gender':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(ProfileResponseDtoGenderEnum),
          ) as ProfileResponseDtoGenderEnum;
          result.gender = valueDes;
          break;
        case r'isVerified':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.isVerified = valueDes;
          break;
        case r'isActive':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.isActive = valueDes;
          break;
        case r'displayNameChangeInfo':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DisplayNameChangeInfoDto),
          ) as DisplayNameChangeInfoDto;
          result.displayNameChangeInfo.replace(valueDes);
          break;
        case r'createdAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.createdAt = valueDes;
          break;
        case r'updatedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.updatedAt = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  ProfileResponseDto deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ProfileResponseDtoBuilder();
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

class ProfileResponseDtoRoleEnum extends EnumClass {

  /// User role
  @BuiltValueEnumConst(wireName: r'customer')
  static const ProfileResponseDtoRoleEnum customer = _$profileResponseDtoRoleEnum_customer;
  /// User role
  @BuiltValueEnumConst(wireName: r'provider')
  static const ProfileResponseDtoRoleEnum provider = _$profileResponseDtoRoleEnum_provider;
  /// User role
  @BuiltValueEnumConst(wireName: r'admin')
  static const ProfileResponseDtoRoleEnum admin = _$profileResponseDtoRoleEnum_admin;

  static Serializer<ProfileResponseDtoRoleEnum> get serializer => _$profileResponseDtoRoleEnumSerializer;

  const ProfileResponseDtoRoleEnum._(String name): super(name);

  static BuiltSet<ProfileResponseDtoRoleEnum> get values => _$profileResponseDtoRoleEnumValues;
  static ProfileResponseDtoRoleEnum valueOf(String name) => _$profileResponseDtoRoleEnumValueOf(name);
}

class ProfileResponseDtoGenderEnum extends EnumClass {

  /// Gender
  @BuiltValueEnumConst(wireName: r'male')
  static const ProfileResponseDtoGenderEnum male = _$profileResponseDtoGenderEnum_male;
  /// Gender
  @BuiltValueEnumConst(wireName: r'female')
  static const ProfileResponseDtoGenderEnum female = _$profileResponseDtoGenderEnum_female;
  /// Gender
  @BuiltValueEnumConst(wireName: r'other')
  static const ProfileResponseDtoGenderEnum other = _$profileResponseDtoGenderEnum_other;

  static Serializer<ProfileResponseDtoGenderEnum> get serializer => _$profileResponseDtoGenderEnumSerializer;

  const ProfileResponseDtoGenderEnum._(String name): super(name);

  static BuiltSet<ProfileResponseDtoGenderEnum> get values => _$profileResponseDtoGenderEnumValues;
  static ProfileResponseDtoGenderEnum valueOf(String name) => _$profileResponseDtoGenderEnumValueOf(name);
}

