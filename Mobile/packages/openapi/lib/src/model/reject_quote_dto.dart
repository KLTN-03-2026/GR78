//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'reject_quote_dto.g.dart';

/// RejectQuoteDto
///
/// Properties:
/// * [reason] - Reason for refusal
@BuiltValue()
abstract class RejectQuoteDto implements Built<RejectQuoteDto, RejectQuoteDtoBuilder> {
  /// Reason for refusal
  @BuiltValueField(wireName: r'reason')
  String? get reason;

  RejectQuoteDto._();

  factory RejectQuoteDto([void updates(RejectQuoteDtoBuilder b)]) = _$RejectQuoteDto;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(RejectQuoteDtoBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<RejectQuoteDto> get serializer => _$RejectQuoteDtoSerializer();
}

class _$RejectQuoteDtoSerializer implements PrimitiveSerializer<RejectQuoteDto> {
  @override
  final Iterable<Type> types = const [RejectQuoteDto, _$RejectQuoteDto];

  @override
  final String wireName = r'RejectQuoteDto';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    RejectQuoteDto object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.reason != null) {
      yield r'reason';
      yield serializers.serialize(
        object.reason,
        specifiedType: const FullType(String),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    RejectQuoteDto object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required RejectQuoteDtoBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'reason':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.reason = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  RejectQuoteDto deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = RejectQuoteDtoBuilder();
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

