//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'login_mobile_dto.g.dart';

/// LoginMobileDto
///
/// Properties:
/// * [identifier] - Email or phone
/// * [password] 
@BuiltValue()
abstract class LoginMobileDto implements Built<LoginMobileDto, LoginMobileDtoBuilder> {
  /// Email or phone
  @BuiltValueField(wireName: r'identifier')
  String get identifier;

  @BuiltValueField(wireName: r'password')
  String get password;

  LoginMobileDto._();

  factory LoginMobileDto([void updates(LoginMobileDtoBuilder b)]) = _$LoginMobileDto;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(LoginMobileDtoBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<LoginMobileDto> get serializer => _$LoginMobileDtoSerializer();
}

class _$LoginMobileDtoSerializer implements PrimitiveSerializer<LoginMobileDto> {
  @override
  final Iterable<Type> types = const [LoginMobileDto, _$LoginMobileDto];

  @override
  final String wireName = r'LoginMobileDto';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    LoginMobileDto object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'identifier';
    yield serializers.serialize(
      object.identifier,
      specifiedType: const FullType(String),
    );
    yield r'password';
    yield serializers.serialize(
      object.password,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    LoginMobileDto object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required LoginMobileDtoBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'identifier':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.identifier = valueDes;
          break;
        case r'password':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.password = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  LoginMobileDto deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = LoginMobileDtoBuilder();
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

