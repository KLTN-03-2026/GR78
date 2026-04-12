//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/post_response_dto.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'feed_response_dto.g.dart';

/// FeedResponseDto
///
/// Properties:
/// * [data] 
/// * [nextCursor] - Next cursor for pagination
/// * [total] 
/// * [hasMore] 
@BuiltValue()
abstract class FeedResponseDto implements Built<FeedResponseDto, FeedResponseDtoBuilder> {
  @BuiltValueField(wireName: r'data')
  BuiltList<PostResponseDto> get data;

  /// Next cursor for pagination
  @BuiltValueField(wireName: r'nextCursor')
  String? get nextCursor;

  @BuiltValueField(wireName: r'total')
  num get total;

  @BuiltValueField(wireName: r'hasMore')
  bool get hasMore;

  FeedResponseDto._();

  factory FeedResponseDto([void updates(FeedResponseDtoBuilder b)]) = _$FeedResponseDto;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(FeedResponseDtoBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<FeedResponseDto> get serializer => _$FeedResponseDtoSerializer();
}

class _$FeedResponseDtoSerializer implements PrimitiveSerializer<FeedResponseDto> {
  @override
  final Iterable<Type> types = const [FeedResponseDto, _$FeedResponseDto];

  @override
  final String wireName = r'FeedResponseDto';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    FeedResponseDto object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'data';
    yield serializers.serialize(
      object.data,
      specifiedType: const FullType(BuiltList, [FullType(PostResponseDto)]),
    );
    if (object.nextCursor != null) {
      yield r'nextCursor';
      yield serializers.serialize(
        object.nextCursor,
        specifiedType: const FullType(String),
      );
    }
    yield r'total';
    yield serializers.serialize(
      object.total,
      specifiedType: const FullType(num),
    );
    yield r'hasMore';
    yield serializers.serialize(
      object.hasMore,
      specifiedType: const FullType(bool),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    FeedResponseDto object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required FeedResponseDtoBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'data':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(PostResponseDto)]),
          ) as BuiltList<PostResponseDto>;
          result.data.replace(valueDes);
          break;
        case r'nextCursor':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.nextCursor = valueDes;
          break;
        case r'total':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(num),
          ) as num;
          result.total = valueDes;
          break;
        case r'hasMore':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.hasMore = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  FeedResponseDto deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = FeedResponseDtoBuilder();
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

