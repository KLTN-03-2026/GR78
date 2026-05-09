//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/post_response_dto_customer.dart';
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'post_response_dto.g.dart';

/// PostResponseDto
///
/// Properties:
/// * [id] 
/// * [title] 
/// * [description] 
/// * [imageUrls] 
/// * [location] 
/// * [desiredTime] 
/// * [budget] 
/// * [status] 
/// * [customerId] 
/// * [customer] 
/// * [createdAt] 
/// * [updatedAt] 
@BuiltValue()
abstract class PostResponseDto implements Built<PostResponseDto, PostResponseDtoBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'title')
  String get title;

  @BuiltValueField(wireName: r'description')
  String get description;

  @BuiltValueField(wireName: r'imageUrls')
  BuiltList<String>? get imageUrls;

  @BuiltValueField(wireName: r'location')
  String? get location;

  @BuiltValueField(wireName: r'desiredTime')
  DateTime? get desiredTime;

  @BuiltValueField(wireName: r'budget')
  num? get budget;

  @BuiltValueField(wireName: r'status')
  PostResponseDtoStatusEnum get status;
  // enum statusEnum {  OPEN,  CLOSED,  };

  @BuiltValueField(wireName: r'customerId')
  String? get customerId;

  @BuiltValueField(wireName: r'customer')
  PostResponseDtoCustomer get customer;

  @BuiltValueField(wireName: r'createdAt')
  DateTime get createdAt;

  @BuiltValueField(wireName: r'updatedAt')
  DateTime get updatedAt;

  PostResponseDto._();

  factory PostResponseDto([void updates(PostResponseDtoBuilder b)]) = _$PostResponseDto;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PostResponseDtoBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PostResponseDto> get serializer => _$PostResponseDtoSerializer();
}

class _$PostResponseDtoSerializer implements PrimitiveSerializer<PostResponseDto> {
  @override
  final Iterable<Type> types = const [PostResponseDto, _$PostResponseDto];

  @override
  final String wireName = r'PostResponseDto';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PostResponseDto object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'title';
    yield serializers.serialize(
      object.title,
      specifiedType: const FullType(String),
    );
    yield r'description';
    yield serializers.serialize(
      object.description,
      specifiedType: const FullType(String),
    );
    if (object.imageUrls != null) {
      yield r'imageUrls';
      yield serializers.serialize(
        object.imageUrls,
        specifiedType: const FullType(BuiltList, [FullType(String)]),
      );
    }
    if (object.location != null) {
      yield r'location';
      yield serializers.serialize(
        object.location,
        specifiedType: const FullType(String),
      );
    }
    if (object.desiredTime != null) {
      yield r'desiredTime';
      yield serializers.serialize(
        object.desiredTime,
        specifiedType: const FullType(DateTime),
      );
    }
    if (object.budget != null) {
      yield r'budget';
      yield serializers.serialize(
        object.budget,
        specifiedType: const FullType(num),
      );
    }
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(PostResponseDtoStatusEnum),
    );
    if (object.customerId != null) {
      yield r'customerId';
      yield serializers.serialize(
        object.customerId,
        specifiedType: const FullType(String),
      );
    }
    yield r'customer';
    yield serializers.serialize(
      object.customer,
      specifiedType: const FullType(PostResponseDtoCustomer),
    );
    yield r'createdAt';
    yield serializers.serialize(
      object.createdAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'updatedAt';
    yield serializers.serialize(
      object.updatedAt,
      specifiedType: const FullType(DateTime),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PostResponseDto object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PostResponseDtoBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.id = valueDes;
          break;
        case r'title':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.title = valueDes;
          break;
        case r'description':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.description = valueDes;
          break;
        case r'imageUrls':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.imageUrls.replace(valueDes);
          break;
        case r'location':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.location = valueDes;
          break;
        case r'desiredTime':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.desiredTime = valueDes;
          break;
        case r'budget':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(num),
          ) as num;
          result.budget = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PostResponseDtoStatusEnum),
          ) as PostResponseDtoStatusEnum;
          result.status = valueDes;
          break;
        case r'customerId':
          if (value != null) {
            final valueDes = serializers.deserialize(
              value,
              specifiedType: const FullType(String),
            ) as String;
            result.customerId = valueDes;
          } else {
            result.customerId = null;
          }
          break;
        case r'customer':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PostResponseDtoCustomer),
          ) as PostResponseDtoCustomer;
          result.customer.replace(valueDes);
          break;
        case r'createdAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.createdAt = valueDes;
          break;
        case r'updatedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.updatedAt = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PostResponseDto deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PostResponseDtoBuilder();
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

class PostResponseDtoStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'OPEN')
  static const PostResponseDtoStatusEnum OPEN = _$postResponseDtoStatusEnum_OPEN;
  @BuiltValueEnumConst(wireName: r'CLOSED')
  static const PostResponseDtoStatusEnum CLOSED = _$postResponseDtoStatusEnum_CLOSED;

  static Serializer<PostResponseDtoStatusEnum> get serializer => _$postResponseDtoStatusEnumSerializer;

  const PostResponseDtoStatusEnum._(String name): super(name);

  static BuiltSet<PostResponseDtoStatusEnum> get values => _$postResponseDtoStatusEnumValues;
  static PostResponseDtoStatusEnum valueOf(String name) => _$postResponseDtoStatusEnumValueOf(name);
}

