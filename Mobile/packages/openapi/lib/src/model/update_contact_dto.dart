//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'update_contact_dto.g.dart';

/// UpdateContactDto
///
/// Properties:
/// * [email] - Email address
/// * [phone] - Phone number (10-11 digits, Vietnam format)
@BuiltValue()
abstract class UpdateContactDto implements Built<UpdateContactDto, UpdateContactDtoBuilder> {
  /// Email address
  @BuiltValueField(wireName: r'email')
  String? get email;

  /// Phone number (10-11 digits, Vietnam format)
  @BuiltValueField(wireName: r'phone')
  String? get phone;

  UpdateContactDto._();

  factory UpdateContactDto([void updates(UpdateContactDtoBuilder b)]) = _$UpdateContactDto;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(UpdateContactDtoBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<UpdateContactDto> get serializer => _$UpdateContactDtoSerializer();
}

class _$UpdateContactDtoSerializer implements PrimitiveSerializer<UpdateContactDto> {
  @override
  final Iterable<Type> types = const [UpdateContactDto, _$UpdateContactDto];

  @override
  final String wireName = r'UpdateContactDto';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    UpdateContactDto object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
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
  }

  @override
  Object serialize(
    Serializers serializers,
    UpdateContactDto object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required UpdateContactDtoBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
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
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  UpdateContactDto deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = UpdateContactDtoBuilder();
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

