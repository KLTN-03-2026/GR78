//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'update_profile_dto.g.dart';

/// UpdateProfileDto
///
/// Properties:
/// * [fullName] - Full legal name
/// * [avatarUrl] - Avatar URL (must be valid URL)
/// * [bio] - User biography/description
/// * [address] - Physical address
/// * [birthday] - Date of birth (must be at least 13 years old)
/// * [gender] - Gender
/// * [displayName] - Public display name (change restricted — use dedicated endpoint)
@BuiltValue()
abstract class UpdateProfileDto implements Built<UpdateProfileDto, UpdateProfileDtoBuilder> {
  /// Full legal name
  @BuiltValueField(wireName: r'fullName')
  String? get fullName;

  /// Avatar URL (must be valid URL)
  @BuiltValueField(wireName: r'avatarUrl')
  String? get avatarUrl;

  /// User biography/description
  @BuiltValueField(wireName: r'bio')
  String? get bio;

  /// Physical address
  @BuiltValueField(wireName: r'address')
  String? get address;

  /// Date of birth (must be at least 13 years old)
  @BuiltValueField(wireName: r'birthday')
  String? get birthday;

  /// Gender
  @BuiltValueField(wireName: r'gender')
  UpdateProfileDtoGenderEnum? get gender;
  // enum genderEnum {  male,  female,  other,  };

  /// Public display name (change restricted — use dedicated endpoint)
  @BuiltValueField(wireName: r'displayName')
  String? get displayName;

  UpdateProfileDto._();

  factory UpdateProfileDto([void updates(UpdateProfileDtoBuilder b)]) = _$UpdateProfileDto;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(UpdateProfileDtoBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<UpdateProfileDto> get serializer => _$UpdateProfileDtoSerializer();
}

class _$UpdateProfileDtoSerializer implements PrimitiveSerializer<UpdateProfileDto> {
  @override
  final Iterable<Type> types = const [UpdateProfileDto, _$UpdateProfileDto];

  @override
  final String wireName = r'UpdateProfileDto';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    UpdateProfileDto object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.fullName != null) {
      yield r'fullName';
      yield serializers.serialize(
        object.fullName,
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
        specifiedType: const FullType(String),
      );
    }
    if (object.gender != null) {
      yield r'gender';
      yield serializers.serialize(
        object.gender,
        specifiedType: const FullType(UpdateProfileDtoGenderEnum),
      );
    }
    if (object.displayName != null) {
      yield r'displayName';
      yield serializers.serialize(
        object.displayName,
        specifiedType: const FullType(String),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    UpdateProfileDto object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required UpdateProfileDtoBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'fullName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.fullName = valueDes;
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
            specifiedType: const FullType(String),
          ) as String;
          result.birthday = valueDes;
          break;
        case r'gender':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(UpdateProfileDtoGenderEnum),
          ) as UpdateProfileDtoGenderEnum;
          result.gender = valueDes;
          break;
        case r'displayName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.displayName = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  UpdateProfileDto deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = UpdateProfileDtoBuilder();
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

class UpdateProfileDtoGenderEnum extends EnumClass {

  /// Gender
  @BuiltValueEnumConst(wireName: r'male')
  static const UpdateProfileDtoGenderEnum male = _$updateProfileDtoGenderEnum_male;
  /// Gender
  @BuiltValueEnumConst(wireName: r'female')
  static const UpdateProfileDtoGenderEnum female = _$updateProfileDtoGenderEnum_female;
  /// Gender
  @BuiltValueEnumConst(wireName: r'other')
  static const UpdateProfileDtoGenderEnum other = _$updateProfileDtoGenderEnum_other;

  static Serializer<UpdateProfileDtoGenderEnum> get serializer => _$updateProfileDtoGenderEnumSerializer;

  const UpdateProfileDtoGenderEnum._(String name): super(name);

  static BuiltSet<UpdateProfileDtoGenderEnum> get values => _$updateProfileDtoGenderEnumValues;
  static UpdateProfileDtoGenderEnum valueOf(String name) => _$updateProfileDtoGenderEnumValueOf(name);
}

