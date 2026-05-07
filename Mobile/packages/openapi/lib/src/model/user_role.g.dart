// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_role.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const UserRole _$customer = const UserRole._('customer');
const UserRole _$provider = const UserRole._('provider');
const UserRole _$admin = const UserRole._('admin');

UserRole _$valueOf(String name) {
  switch (name) {
    case 'customer':
      return _$customer;
    case 'provider':
      return _$provider;
    case 'admin':
      return _$admin;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<UserRole> _$values = BuiltSet<UserRole>(const <UserRole>[
  _$customer,
  _$provider,
  _$admin,
]);

class _$UserRoleMeta {
  const _$UserRoleMeta();
  UserRole get customer => _$customer;
  UserRole get provider => _$provider;
  UserRole get admin => _$admin;
  UserRole valueOf(String name) => _$valueOf(name);
  BuiltSet<UserRole> get values => _$values;
}

abstract class _$UserRoleMixin {
  // ignore: non_constant_identifier_names
  _$UserRoleMeta get UserRole => const _$UserRoleMeta();
}

Serializer<UserRole> _$userRoleSerializer = _$UserRoleSerializer();

class _$UserRoleSerializer implements PrimitiveSerializer<UserRole> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'customer': 'customer',
    'provider': 'provider',
    'admin': 'admin',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'customer': 'customer',
    'provider': 'provider',
    'admin': 'admin',
  };

  @override
  final Iterable<Type> types = const <Type>[UserRole];
  @override
  final String wireName = 'UserRole';

  @override
  Object serialize(Serializers serializers, UserRole object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  UserRole deserialize(Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      UserRole.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
