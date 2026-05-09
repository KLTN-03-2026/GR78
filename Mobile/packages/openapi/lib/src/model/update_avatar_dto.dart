//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'update_avatar_dto.g.dart';

/// UpdateAvatarDto
///
/// Properties:
/// * [avatarUrl] - Avatar URL
@BuiltValue()
abstract class UpdateAvatarDto implements Built<UpdateAvatarDto, UpdateAvatarDtoBuilder> {
  /// Avatar URL
  @BuiltValueField(wireName: r'avatarUrl')
  String get avatarUrl;

  UpdateAvatarDto._();

  factory UpdateAvatarDto([void updates(UpdateAvatarDtoBuilder b)]) = _$UpdateAvatarDto;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(UpdateAvatarDtoBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<UpdateAvatarDto> get serializer => _$UpdateAvatarDtoSerializer();
}

class _$UpdateAvatarDtoSerializer implements PrimitiveSerializer<UpdateAvatarDto> {
  @override
  final Iterable<Type> types = const [UpdateAvatarDto, _$UpdateAvatarDto];

  @override
  final String wireName = r'UpdateAvatarDto';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    UpdateAvatarDto object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'avatarUrl';
    yield serializers.serialize(
      object.avatarUrl,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    UpdateAvatarDto object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required UpdateAvatarDtoBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
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
  UpdateAvatarDto deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = UpdateAvatarDtoBuilder();
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

