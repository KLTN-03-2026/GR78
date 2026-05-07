//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'delete_account_response_dto.g.dart';

/// DeleteAccountResponseDto
///
/// Properties:
/// * [success] - Operation success status
/// * [message] - Response message
@BuiltValue()
abstract class DeleteAccountResponseDto implements Built<DeleteAccountResponseDto, DeleteAccountResponseDtoBuilder> {
  /// Operation success status
  @BuiltValueField(wireName: r'success')
  bool get success;

  /// Response message
  @BuiltValueField(wireName: r'message')
  String get message;

  DeleteAccountResponseDto._();

  factory DeleteAccountResponseDto([void updates(DeleteAccountResponseDtoBuilder b)]) = _$DeleteAccountResponseDto;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(DeleteAccountResponseDtoBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<DeleteAccountResponseDto> get serializer => _$DeleteAccountResponseDtoSerializer();
}

class _$DeleteAccountResponseDtoSerializer implements PrimitiveSerializer<DeleteAccountResponseDto> {
  @override
  final Iterable<Type> types = const [DeleteAccountResponseDto, _$DeleteAccountResponseDto];

  @override
  final String wireName = r'DeleteAccountResponseDto';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    DeleteAccountResponseDto object, {
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
  }

  @override
  Object serialize(
    Serializers serializers,
    DeleteAccountResponseDto object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required DeleteAccountResponseDtoBuilder result,
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
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  DeleteAccountResponseDto deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = DeleteAccountResponseDtoBuilder();
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

