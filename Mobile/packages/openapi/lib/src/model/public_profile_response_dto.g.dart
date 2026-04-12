// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'public_profile_response_dto.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const PublicProfileResponseDtoRoleEnum
    _$publicProfileResponseDtoRoleEnum_customer =
    const PublicProfileResponseDtoRoleEnum._('customer');
const PublicProfileResponseDtoRoleEnum
    _$publicProfileResponseDtoRoleEnum_provider =
    const PublicProfileResponseDtoRoleEnum._('provider');
const PublicProfileResponseDtoRoleEnum
    _$publicProfileResponseDtoRoleEnum_admin =
    const PublicProfileResponseDtoRoleEnum._('admin');

PublicProfileResponseDtoRoleEnum _$publicProfileResponseDtoRoleEnumValueOf(
    String name) {
  switch (name) {
    case 'customer':
      return _$publicProfileResponseDtoRoleEnum_customer;
    case 'provider':
      return _$publicProfileResponseDtoRoleEnum_provider;
    case 'admin':
      return _$publicProfileResponseDtoRoleEnum_admin;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<PublicProfileResponseDtoRoleEnum>
    _$publicProfileResponseDtoRoleEnumValues = BuiltSet<
        PublicProfileResponseDtoRoleEnum>(const <PublicProfileResponseDtoRoleEnum>[
  _$publicProfileResponseDtoRoleEnum_customer,
  _$publicProfileResponseDtoRoleEnum_provider,
  _$publicProfileResponseDtoRoleEnum_admin,
]);

Serializer<PublicProfileResponseDtoRoleEnum>
    _$publicProfileResponseDtoRoleEnumSerializer =
    _$PublicProfileResponseDtoRoleEnumSerializer();

class _$PublicProfileResponseDtoRoleEnumSerializer
    implements PrimitiveSerializer<PublicProfileResponseDtoRoleEnum> {
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
  final Iterable<Type> types = const <Type>[PublicProfileResponseDtoRoleEnum];
  @override
  final String wireName = 'PublicProfileResponseDtoRoleEnum';

  @override
  Object serialize(
          Serializers serializers, PublicProfileResponseDtoRoleEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  PublicProfileResponseDtoRoleEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      PublicProfileResponseDtoRoleEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$PublicProfileResponseDto extends PublicProfileResponseDto {
  @override
  final String id;
  @override
  final PublicProfileResponseDtoRoleEnum role;
  @override
  final String? displayName;
  @override
  final String? avatarUrl;
  @override
  final String? bio;
  @override
  final bool isVerified;
  @override
  final DateTime memberSince;

  factory _$PublicProfileResponseDto(
          [void Function(PublicProfileResponseDtoBuilder)? updates]) =>
      (PublicProfileResponseDtoBuilder()..update(updates))._build();

  _$PublicProfileResponseDto._(
      {required this.id,
      required this.role,
      this.displayName,
      this.avatarUrl,
      this.bio,
      required this.isVerified,
      required this.memberSince})
      : super._();
  @override
  PublicProfileResponseDto rebuild(
          void Function(PublicProfileResponseDtoBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  PublicProfileResponseDtoBuilder toBuilder() =>
      PublicProfileResponseDtoBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PublicProfileResponseDto &&
        id == other.id &&
        role == other.role &&
        displayName == other.displayName &&
        avatarUrl == other.avatarUrl &&
        bio == other.bio &&
        isVerified == other.isVerified &&
        memberSince == other.memberSince;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, role.hashCode);
    _$hash = $jc(_$hash, displayName.hashCode);
    _$hash = $jc(_$hash, avatarUrl.hashCode);
    _$hash = $jc(_$hash, bio.hashCode);
    _$hash = $jc(_$hash, isVerified.hashCode);
    _$hash = $jc(_$hash, memberSince.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PublicProfileResponseDto')
          ..add('id', id)
          ..add('role', role)
          ..add('displayName', displayName)
          ..add('avatarUrl', avatarUrl)
          ..add('bio', bio)
          ..add('isVerified', isVerified)
          ..add('memberSince', memberSince))
        .toString();
  }
}

class PublicProfileResponseDtoBuilder
    implements
        Builder<PublicProfileResponseDto, PublicProfileResponseDtoBuilder> {
  _$PublicProfileResponseDto? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  PublicProfileResponseDtoRoleEnum? _role;
  PublicProfileResponseDtoRoleEnum? get role => _$this._role;
  set role(PublicProfileResponseDtoRoleEnum? role) => _$this._role = role;

  String? _displayName;
  String? get displayName => _$this._displayName;
  set displayName(String? displayName) => _$this._displayName = displayName;

  String? _avatarUrl;
  String? get avatarUrl => _$this._avatarUrl;
  set avatarUrl(String? avatarUrl) => _$this._avatarUrl = avatarUrl;

  String? _bio;
  String? get bio => _$this._bio;
  set bio(String? bio) => _$this._bio = bio;

  bool? _isVerified;
  bool? get isVerified => _$this._isVerified;
  set isVerified(bool? isVerified) => _$this._isVerified = isVerified;

  DateTime? _memberSince;
  DateTime? get memberSince => _$this._memberSince;
  set memberSince(DateTime? memberSince) => _$this._memberSince = memberSince;

  PublicProfileResponseDtoBuilder() {
    PublicProfileResponseDto._defaults(this);
  }

  PublicProfileResponseDtoBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _role = $v.role;
      _displayName = $v.displayName;
      _avatarUrl = $v.avatarUrl;
      _bio = $v.bio;
      _isVerified = $v.isVerified;
      _memberSince = $v.memberSince;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PublicProfileResponseDto other) {
    _$v = other as _$PublicProfileResponseDto;
  }

  @override
  void update(void Function(PublicProfileResponseDtoBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PublicProfileResponseDto build() => _build();

  _$PublicProfileResponseDto _build() {
    final _$result = _$v ??
        _$PublicProfileResponseDto._(
          id: BuiltValueNullFieldError.checkNotNull(
              id, r'PublicProfileResponseDto', 'id'),
          role: BuiltValueNullFieldError.checkNotNull(
              role, r'PublicProfileResponseDto', 'role'),
          displayName: displayName,
          avatarUrl: avatarUrl,
          bio: bio,
          isVerified: BuiltValueNullFieldError.checkNotNull(
              isVerified, r'PublicProfileResponseDto', 'isVerified'),
          memberSince: BuiltValueNullFieldError.checkNotNull(
              memberSince, r'PublicProfileResponseDto', 'memberSince'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
