//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'update_post_dto.g.dart';

/// UpdatePostDto
///
/// Properties:
/// * [title] - Post title
/// * [description] - Detailed description
/// * [imageUrls] - Image URLs
/// * [location] - Service location
/// * [desiredTime] - Desired completion time
/// * [budget] - Budget in VND
/// * [status] - Post status
@BuiltValue()
abstract class UpdatePostDto implements Built<UpdatePostDto, UpdatePostDtoBuilder> {
  /// Post title
  @BuiltValueField(wireName: r'title')
  String? get title;

  /// Detailed description
  @BuiltValueField(wireName: r'description')
  String? get description;

  /// Image URLs
  @BuiltValueField(wireName: r'imageUrls')
  BuiltList<String>? get imageUrls;

  /// Service location
  @BuiltValueField(wireName: r'location')
  String? get location;

  /// Desired completion time
  @BuiltValueField(wireName: r'desiredTime')
  DateTime? get desiredTime;

  /// Budget in VND
  @BuiltValueField(wireName: r'budget')
  num? get budget;

  /// Post status
  @BuiltValueField(wireName: r'status')
  UpdatePostDtoStatusEnum? get status;
  // enum statusEnum {  OPEN,  CLOSED,  };

  UpdatePostDto._();

  factory UpdatePostDto([void updates(UpdatePostDtoBuilder b)]) = _$UpdatePostDto;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(UpdatePostDtoBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<UpdatePostDto> get serializer => _$UpdatePostDtoSerializer();
}

class _$UpdatePostDtoSerializer implements PrimitiveSerializer<UpdatePostDto> {
  @override
  final Iterable<Type> types = const [UpdatePostDto, _$UpdatePostDto];

  @override
  final String wireName = r'UpdatePostDto';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    UpdatePostDto object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.title != null) {
      yield r'title';
      yield serializers.serialize(
        object.title,
        specifiedType: const FullType(String),
      );
    }
    if (object.description != null) {
      yield r'description';
      yield serializers.serialize(
        object.description,
        specifiedType: const FullType(String),
      );
    }
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
    if (object.status != null) {
      yield r'status';
      yield serializers.serialize(
        object.status,
        specifiedType: const FullType(UpdatePostDtoStatusEnum),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    UpdatePostDto object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required UpdatePostDtoBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
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
            specifiedType: const FullType(UpdatePostDtoStatusEnum),
          ) as UpdatePostDtoStatusEnum;
          result.status = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  UpdatePostDto deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = UpdatePostDtoBuilder();
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

class UpdatePostDtoStatusEnum extends EnumClass {

  /// Post status
  @BuiltValueEnumConst(wireName: r'OPEN')
  static const UpdatePostDtoStatusEnum OPEN = _$updatePostDtoStatusEnum_OPEN;
  /// Post status
  @BuiltValueEnumConst(wireName: r'CLOSED')
  static const UpdatePostDtoStatusEnum CLOSED = _$updatePostDtoStatusEnum_CLOSED;

  static Serializer<UpdatePostDtoStatusEnum> get serializer => _$updatePostDtoStatusEnumSerializer;

  const UpdatePostDtoStatusEnum._(String name): super(name);

  static BuiltSet<UpdatePostDtoStatusEnum> get values => _$updatePostDtoStatusEnumValues;
  static UpdatePostDtoStatusEnum valueOf(String name) => _$updatePostDtoStatusEnumValueOf(name);
}

