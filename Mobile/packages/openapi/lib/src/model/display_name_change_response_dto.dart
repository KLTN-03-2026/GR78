//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'display_name_change_response_dto.g.dart';

/// DisplayNameChangeResponseDto
///
/// Properties:
/// * [success] - Operation success status
/// * [message] - Response message
/// * [newDisplayName] - New display name
/// * [changedAt] - Change timestamp
/// * [daysUntilNextChange] - Days until next change allowed
@BuiltValue()
abstract class DisplayNameChangeResponseDto implements Built<DisplayNameChangeResponseDto, DisplayNameChangeResponseDtoBuilder> {
  /// Operation success status
  @BuiltValueField(wireName: r'success')
  bool get success;

  /// Response message
  @BuiltValueField(wireName: r'message')
  String get message;

  /// New display name
  @BuiltValueField(wireName: r'newDisplayName')
  String get newDisplayName;

  /// Change timestamp
  @BuiltValueField(wireName: r'changedAt')
  DateTime get changedAt;

  /// Days until next change allowed
  @BuiltValueField(wireName: r'daysUntilNextChange')
  num get daysUntilNextChange;

  DisplayNameChangeResponseDto._();

  factory DisplayNameChangeResponseDto([void updates(DisplayNameChangeResponseDtoBuilder b)]) = _$DisplayNameChangeResponseDto;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(DisplayNameChangeResponseDtoBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<DisplayNameChangeResponseDto> get serializer => _$DisplayNameChangeResponseDtoSerializer();
}

class _$DisplayNameChangeResponseDtoSerializer implements PrimitiveSerializer<DisplayNameChangeResponseDto> {
  @override
  final Iterable<Type> types = const [DisplayNameChangeResponseDto, _$DisplayNameChangeResponseDto];

  @override
  final String wireName = r'DisplayNameChangeResponseDto';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    DisplayNameChangeResponseDto object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'success';
    yield serializers.serialize(
      object.success,
      specifiedType: const FullType(bool),
    );
    yield r'message';
    yield serializers.serialize(
      object.message,
      specifiedType: const FullType(String),
    );
    yield r'newDisplayName';
    yield serializers.serialize(
      object.newDisplayName,
      specifiedType: const FullType(String),
    );
    yield r'changedAt';
    yield serializers.serialize(
      object.changedAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'daysUntilNextChange';
    yield serializers.serialize(
      object.daysUntilNextChange,
      specifiedType: const FullType(num),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    DisplayNameChangeResponseDto object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required DisplayNameChangeResponseDtoBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'success':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.success = valueDes;
          break;
        case r'message':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.message = valueDes;
          break;
        case r'newDisplayName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.newDisplayName = valueDes;
          break;
        case r'changedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.changedAt = valueDes;
          break;
        case r'daysUntilNextChange':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(num),
          ) as num;
          result.daysUntilNextChange = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  DisplayNameChangeResponseDto deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = DisplayNameChangeResponseDtoBuilder();
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

