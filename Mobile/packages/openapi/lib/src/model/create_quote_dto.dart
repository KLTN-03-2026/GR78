//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'create_quote_dto.g.dart';

/// CreateQuoteDto
///
/// Properties:
/// * [postId] - ID post
/// * [price] - the price of a quote 
/// * [description] - Detailed description quote
/// * [terms] - Terms and conditions
/// * [estimatedDuration] - Estimated time (minutes)
/// * [imageUrls] - List of image URLs
@BuiltValue()
abstract class CreateQuoteDto implements Built<CreateQuoteDto, CreateQuoteDtoBuilder> {
  /// ID post
  @BuiltValueField(wireName: r'postId')
  String get postId;

  /// the price of a quote 
  @BuiltValueField(wireName: r'price')
  num get price;

  /// Detailed description quote
  @BuiltValueField(wireName: r'description')
  String get description;

  /// Terms and conditions
  @BuiltValueField(wireName: r'terms')
  String? get terms;

  /// Estimated time (minutes)
  @BuiltValueField(wireName: r'estimatedDuration')
  num? get estimatedDuration;

  /// List of image URLs
  @BuiltValueField(wireName: r'imageUrls')
  BuiltList<String>? get imageUrls;

  CreateQuoteDto._();

  factory CreateQuoteDto([void updates(CreateQuoteDtoBuilder b)]) = _$CreateQuoteDto;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CreateQuoteDtoBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CreateQuoteDto> get serializer => _$CreateQuoteDtoSerializer();
}

class _$CreateQuoteDtoSerializer implements PrimitiveSerializer<CreateQuoteDto> {
  @override
  final Iterable<Type> types = const [CreateQuoteDto, _$CreateQuoteDto];

  @override
  final String wireName = r'CreateQuoteDto';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CreateQuoteDto object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'postId';
    yield serializers.serialize(
      object.postId,
      specifiedType: const FullType(String),
    );
    yield r'price';
    yield serializers.serialize(
      object.price,
      specifiedType: const FullType(num),
    );
    yield r'description';
    yield serializers.serialize(
      object.description,
      specifiedType: const FullType(String),
    );
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
    CreateQuoteDto object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CreateQuoteDtoBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'postId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.postId = valueDes;
          break;
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
  CreateQuoteDto deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CreateQuoteDtoBuilder();
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

