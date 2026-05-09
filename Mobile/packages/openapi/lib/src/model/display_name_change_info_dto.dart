//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'display_name_change_info_dto.g.dart';

/// DisplayNameChangeInfoDto
///
/// Properties:
/// * [canChange] - Whether user can change display name now
/// * [lastChanged] - Last display name change timestamp
/// * [changeCount] - Total number of display name changes
/// * [daysUntilNextChange] - Days remaining until next change is allowed
@BuiltValue()
abstract class DisplayNameChangeInfoDto implements Built<DisplayNameChangeInfoDto, DisplayNameChangeInfoDtoBuilder> {
  /// Whether user can change display name now
  @BuiltValueField(wireName: r'canChange')
  bool get canChange;

  /// Last display name change timestamp
  @BuiltValueField(wireName: r'lastChanged')
  DateTime? get lastChanged;

  /// Total number of display name changes
  @BuiltValueField(wireName: r'changeCount')
  num get changeCount;

  /// Days remaining until next change is allowed
  @BuiltValueField(wireName: r'daysUntilNextChange')
  num get daysUntilNextChange;

  DisplayNameChangeInfoDto._();

  factory DisplayNameChangeInfoDto([void updates(DisplayNameChangeInfoDtoBuilder b)]) = _$DisplayNameChangeInfoDto;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(DisplayNameChangeInfoDtoBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<DisplayNameChangeInfoDto> get serializer => _$DisplayNameChangeInfoDtoSerializer();
}

class _$DisplayNameChangeInfoDtoSerializer implements PrimitiveSerializer<DisplayNameChangeInfoDto> {
  @override
  final Iterable<Type> types = const [DisplayNameChangeInfoDto, _$DisplayNameChangeInfoDto];

  @override
  final String wireName = r'DisplayNameChangeInfoDto';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    DisplayNameChangeInfoDto object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'canChange';
    yield serializers.serialize(
      object.canChange,
      specifiedType: const FullType(bool),
    );
    if (object.lastChanged != null) {
      yield r'lastChanged';
      yield serializers.serialize(
        object.lastChanged,
        specifiedType: const FullType(DateTime),
      );
    }
    yield r'changeCount';
    yield serializers.serialize(
      object.changeCount,
      specifiedType: const FullType(num),
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
    DisplayNameChangeInfoDto object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required DisplayNameChangeInfoDtoBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'canChange':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.canChange = valueDes;
          break;
        case r'lastChanged':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.lastChanged = valueDes;
          break;
        case r'changeCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(num),
          ) as num;
          result.changeCount = valueDes;
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
  DisplayNameChangeInfoDto deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = DisplayNameChangeInfoDtoBuilder();
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

