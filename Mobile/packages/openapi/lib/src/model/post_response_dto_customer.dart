//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'post_response_dto_customer.g.dart';

/// Customer information
///
/// Properties:
/// * [id] 
/// * [fullName] 
/// * [avatarUrl] 
@BuiltValue()
abstract class PostResponseDtoCustomer implements Built<PostResponseDtoCustomer, PostResponseDtoCustomerBuilder> {
  @BuiltValueField(wireName: r'id')
  String? get id;

  @BuiltValueField(wireName: r'fullName')
  String? get fullName;

  @BuiltValueField(wireName: r'avatarUrl')
  String? get avatarUrl;

  PostResponseDtoCustomer._();

  factory PostResponseDtoCustomer([void updates(PostResponseDtoCustomerBuilder b)]) = _$PostResponseDtoCustomer;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PostResponseDtoCustomerBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PostResponseDtoCustomer> get serializer => _$PostResponseDtoCustomerSerializer();
}

class _$PostResponseDtoCustomerSerializer implements PrimitiveSerializer<PostResponseDtoCustomer> {
  @override
  final Iterable<Type> types = const [PostResponseDtoCustomer, _$PostResponseDtoCustomer];

  @override
  final String wireName = r'PostResponseDtoCustomer';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PostResponseDtoCustomer object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.id != null) {
      yield r'id';
      yield serializers.serialize(
        object.id,
        specifiedType: const FullType(String),
      );
    }
    if (object.fullName != null) {
      yield r'fullName';
      yield serializers.serialize(
        object.fullName,
        specifiedType: const FullType(String),
      );
    }
    if (object.avatarUrl != null) {
      yield r'avatarUrl';
      yield serializers.serialize(
        object.avatarUrl,
        specifiedType: const FullType(String),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    PostResponseDtoCustomer object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PostResponseDtoCustomerBuilder result,
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
        case r'fullName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.fullName = valueDes;
          break;
        case r'avatarUrl':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.avatarUrl = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PostResponseDtoCustomer deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PostResponseDtoCustomerBuilder();
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

