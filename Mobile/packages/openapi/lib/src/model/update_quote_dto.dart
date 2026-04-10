//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'update_quote_dto.g.dart';

/// UpdateQuoteDto
///
/// Properties:
/// * [price] - New offer price
/// * [description] - New description
/// * [terms] - New Terms
/// * [estimatedDuration] - New estimated time
/// * [imageUrls] - New image
@BuiltValue()
abstract class UpdateQuoteDto implements Built<UpdateQuoteDto, UpdateQuoteDtoBuilder> {
  /// New offer price
  @BuiltValueField(wireName: r'price')
  num? get price;

  /// New description
  @BuiltValueField(wireName: r'description')
  String? get description;

  /// New Terms
  @BuiltValueField(wireName: r'terms')
  String? get terms;

  /// New estimated time
  @BuiltValueField(wireName: r'estimatedDuration')
  num? get estimatedDuration;

  /// New image
  @BuiltValueField(wireName: r'imageUrls')
  BuiltList<String>? get imageUrls;

  UpdateQuoteDto._();

  factory UpdateQuoteDto([void updates(UpdateQuoteDtoBuilder b)]) = _$UpdateQuoteDto;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(UpdateQuoteDtoBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<UpdateQuoteDto> get serializer => _$UpdateQuoteDtoSerializer();
}

class _$UpdateQuoteDtoSerializer implements PrimitiveSerializer<UpdateQuoteDto> {
  @override
  final Iterable<Type> types = const [UpdateQuoteDto, _$UpdateQuoteDto];

  @override
  final String wireName = r'UpdateQuoteDto';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    UpdateQuoteDto object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.price != null) {
      yield r'price';
      yield serializers.serialize(
        object.price,
        specifiedType: const FullType(num),
      );
    }
    if (object.description != null) {
      yield r'description';
      yield serializers.serialize(
        object.description,
        specifiedType: const FullType(String),
      );
    }
    if (object.terms != null) {
      yield r'terms';
      yield serializers.serialize(
        object.terms,
        specifiedType: const FullType(String),
      );
    }
    if (object.estimatedDuration != null) {
      yield r'estimatedDuration';
      yield serializers.serialize(
        object.estimatedDuration,
        specifiedType: const FullType(num),
      );
    }
    if (object.imageUrls != null) {
      yield r'imageUrls';
      yield serializers.serialize(
        object.imageUrls,
        specifiedType: const FullType(BuiltList, [FullType(String)]),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    UpdateQuoteDto object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required UpdateQuoteDtoBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'price':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(num),
          ) as num;
          result.price = valueDes;
          break;
        case r'description':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.description = valueDes;
          break;
        case r'terms':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.terms = valueDes;
          break;
        case r'estimatedDuration':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(num),
          ) as num;
          result.estimatedDuration = valueDes;
          break;
        case r'imageUrls':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.imageUrls.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  UpdateQuoteDto deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = UpdateQuoteDtoBuilder();
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

