//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'change_display_name_dto.g.dart';

/// ChangeDisplayNameDto
///
/// Properties:
/// * [displayName] - New display name (can only change every 30 days)
@BuiltValue()
abstract class ChangeDisplayNameDto implements Built<ChangeDisplayNameDto, ChangeDisplayNameDtoBuilder> {
  /// New display name (can only change every 30 days)
  @BuiltValueField(wireName: r'displayName')
  String get displayName;

  ChangeDisplayNameDto._();

  factory ChangeDisplayNameDto([void updates(ChangeDisplayNameDtoBuilder b)]) = _$ChangeDisplayNameDto;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ChangeDisplayNameDtoBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ChangeDisplayNameDto> get serializer => _$ChangeDisplayNameDtoSerializer();
}

class _$ChangeDisplayNameDtoSerializer implements PrimitiveSerializer<ChangeDisplayNameDto> {
  @override
  final Iterable<Type> types = const [ChangeDisplayNameDto, _$ChangeDisplayNameDto];

  @override
  final String wireName = r'ChangeDisplayNameDto';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ChangeDisplayNameDto object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'displayName';
    yield serializers.serialize(
      object.displayName,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    ChangeDisplayNameDto object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ChangeDisplayNameDtoBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
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
  ChangeDisplayNameDto deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ChangeDisplayNameDtoBuilder();
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

