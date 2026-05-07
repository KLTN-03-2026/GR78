// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'profile_response_dto.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const ProfileResponseDtoRoleEnum _$profileResponseDtoRoleEnum_customer =
    const ProfileResponseDtoRoleEnum._('customer');
const ProfileResponseDtoRoleEnum _$profileResponseDtoRoleEnum_provider =
    const ProfileResponseDtoRoleEnum._('provider');
const ProfileResponseDtoRoleEnum _$profileResponseDtoRoleEnum_admin =
    const ProfileResponseDtoRoleEnum._('admin');

ProfileResponseDtoRoleEnum _$profileResponseDtoRoleEnumValueOf(String name) {
  switch (name) {
    case 'customer':
      return _$profileResponseDtoRoleEnum_customer;
    case 'provider':
      return _$profileResponseDtoRoleEnum_provider;
    case 'admin':
      return _$profileResponseDtoRoleEnum_admin;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<ProfileResponseDtoRoleEnum> _$profileResponseDtoRoleEnumValues =
    BuiltSet<ProfileResponseDtoRoleEnum>(const <ProfileResponseDtoRoleEnum>[
  _$profileResponseDtoRoleEnum_customer,
  _$profileResponseDtoRoleEnum_provider,
  _$profileResponseDtoRoleEnum_admin,
]);

const ProfileResponseDtoGenderEnum _$profileResponseDtoGenderEnum_male =
    const ProfileResponseDtoGenderEnum._('male');
const ProfileResponseDtoGenderEnum _$profileResponseDtoGenderEnum_female =
    const ProfileResponseDtoGenderEnum._('female');
const ProfileResponseDtoGenderEnum _$profileResponseDtoGenderEnum_other =
    const ProfileResponseDtoGenderEnum._('other');

ProfileResponseDtoGenderEnum _$profileResponseDtoGenderEnumValueOf(
    String name) {
  switch (name) {
    case 'male':
      return _$profileResponseDtoGenderEnum_male;
    case 'female':
      return _$profileResponseDtoGenderEnum_female;
    case 'other':
      return _$profileResponseDtoGenderEnum_other;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<ProfileResponseDtoGenderEnum>
    _$profileResponseDtoGenderEnumValues =
    BuiltSet<ProfileResponseDtoGenderEnum>(const <ProfileResponseDtoGenderEnum>[
  _$profileResponseDtoGenderEnum_male,
  _$profileResponseDtoGenderEnum_female,
  _$profileResponseDtoGenderEnum_other,
]);

Serializer<ProfileResponseDtoRoleEnum> _$profileResponseDtoRoleEnumSerializer =
    _$ProfileResponseDtoRoleEnumSerializer();
Serializer<ProfileResponseDtoGenderEnum>
    _$profileResponseDtoGenderEnumSerializer =
    _$ProfileResponseDtoGenderEnumSerializer();

class _$ProfileResponseDtoRoleEnumSerializer
    implements PrimitiveSerializer<ProfileResponseDtoRoleEnum> {
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
  final Iterable<Type> types = const <Type>[ProfileResponseDtoRoleEnum];
  @override
  final String wireName = 'ProfileResponseDtoRoleEnum';

  @override
  Object serialize(Serializers serializers, ProfileResponseDtoRoleEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  ProfileResponseDtoRoleEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      ProfileResponseDtoRoleEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$ProfileResponseDtoGenderEnumSerializer
    implements PrimitiveSerializer<ProfileResponseDtoGenderEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'male': 'male',
    'female': 'female',
    'other': 'other',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'male': 'male',
    'female': 'female',
    'other': 'other',
  };

  @override
  final Iterable<Type> types = const <Type>[ProfileResponseDtoGenderEnum];
  @override
  final String wireName = 'ProfileResponseDtoGenderEnum';

  @override
  Object serialize(Serializers serializers, ProfileResponseDtoGenderEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  ProfileResponseDtoGenderEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      ProfileResponseDtoGenderEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$ProfileResponseDto extends ProfileResponseDto {
  @override
  final String id;
  @override
  final String? email;
  @override
  final String? phone;
  @override
  final ProfileResponseDtoRoleEnum role;
  @override
  final String? fullName;
  @override
  final String? displayName;
  @override
  final String? avatarUrl;
  @override
  final String? bio;
  @override
  final String? address;
  @override
  final DateTime? birthday;
  @override
  final ProfileResponseDtoGenderEnum? gender;
  @override
  final bool isVerified;
  @override
  final bool isActive;
  @override
  final DisplayNameChangeInfoDto displayNameChangeInfo;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;

  factory _$ProfileResponseDto(
          [void Function(ProfileResponseDtoBuilder)? updates]) =>
      (ProfileResponseDtoBuilder()..update(updates))._build();

  _$ProfileResponseDto._(
      {required this.id,
      this.email,
      this.phone,
      required this.role,
      this.fullName,
      this.displayName,
      this.avatarUrl,
      this.bio,
      this.address,
      this.birthday,
      this.gender,
      required this.isVerified,
      required this.isActive,
      required this.displayNameChangeInfo,
      required this.createdAt,
      required this.updatedAt})
      : super._();
  @override
  ProfileResponseDto rebuild(
          void Function(ProfileResponseDtoBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ProfileResponseDtoBuilder toBuilder() =>
      ProfileResponseDtoBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ProfileResponseDto &&
        id == other.id &&
        email == other.email &&
        phone == other.phone &&
        role == other.role &&
        fullName == other.fullName &&
        displayName == other.displayName &&
        avatarUrl == other.avatarUrl &&
        bio == other.bio &&
        address == other.address &&
        birthday == other.birthday &&
        gender == other.gender &&
        isVerified == other.isVerified &&
        isActive == other.isActive &&
        displayNameChangeInfo == other.displayNameChangeInfo &&
        createdAt == other.createdAt &&
        updatedAt == other.updatedAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, email.hashCode);
    _$hash = $jc(_$hash, phone.hashCode);
    _$hash = $jc(_$hash, role.hashCode);
    _$hash = $jc(_$hash, fullName.hashCode);
    _$hash = $jc(_$hash, displayName.hashCode);
    _$hash = $jc(_$hash, avatarUrl.hashCode);
    _$hash = $jc(_$hash, bio.hashCode);
    _$hash = $jc(_$hash, address.hashCode);
    _$hash = $jc(_$hash, birthday.hashCode);
    _$hash = $jc(_$hash, gender.hashCode);
    _$hash = $jc(_$hash, isVerified.hashCode);
    _$hash = $jc(_$hash, isActive.hashCode);
    _$hash = $jc(_$hash, displayNameChangeInfo.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jc(_$hash, updatedAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ProfileResponseDto')
          ..add('id', id)
          ..add('email', email)
          ..add('phone', phone)
          ..add('role', role)
          ..add('fullName', fullName)
          ..add('displayName', displayName)
          ..add('avatarUrl', avatarUrl)
          ..add('bio', bio)
          ..add('address', address)
          ..add('birthday', birthday)
          ..add('gender', gender)
          ..add('isVerified', isVerified)
          ..add('isActive', isActive)
          ..add('displayNameChangeInfo', displayNameChangeInfo)
          ..add('createdAt', createdAt)
          ..add('updatedAt', updatedAt))
        .toString();
  }
}

class ProfileResponseDtoBuilder
    implements Builder<ProfileResponseDto, ProfileResponseDtoBuilder> {
  _$ProfileResponseDto? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _email;
  String? get email => _$this._email;
  set email(String? email) => _$this._email = email;

  String? _phone;
  String? get phone => _$this._phone;
  set phone(String? phone) => _$this._phone = phone;

  ProfileResponseDtoRoleEnum? _role;
  ProfileResponseDtoRoleEnum? get role => _$this._role;
  set role(ProfileResponseDtoRoleEnum? role) => _$this._role = role;

  String? _fullName;
  String? get fullName => _$this._fullName;
  set fullName(String? fullName) => _$this._fullName = fullName;

  String? _displayName;
  String? get displayName => _$this._displayName;
  set displayName(String? displayName) => _$this._displayName = displayName;

  String? _avatarUrl;
  String? get avatarUrl => _$this._avatarUrl;
  set avatarUrl(String? avatarUrl) => _$this._avatarUrl = avatarUrl;

  String? _bio;
  String? get bio => _$this._bio;
  set bio(String? bio) => _$this._bio = bio;

  String? _address;
  String? get address => _$this._address;
  set address(String? address) => _$this._address = address;

  DateTime? _birthday;
  DateTime? get birthday => _$this._birthday;
  set birthday(DateTime? birthday) => _$this._birthday = birthday;

  ProfileResponseDtoGenderEnum? _gender;
  ProfileResponseDtoGenderEnum? get gender => _$this._gender;
  set gender(ProfileResponseDtoGenderEnum? gender) => _$this._gender = gender;

  bool? _isVerified;
  bool? get isVerified => _$this._isVerified;
  set isVerified(bool? isVerified) => _$this._isVerified = isVerified;

  bool? _isActive;
  bool? get isActive => _$this._isActive;
  set isActive(bool? isActive) => _$this._isActive = isActive;

  DisplayNameChangeInfoDtoBuilder? _displayNameChangeInfo;
  DisplayNameChangeInfoDtoBuilder get displayNameChangeInfo =>
      _$this._displayNameChangeInfo ??= DisplayNameChangeInfoDtoBuilder();
  set displayNameChangeInfo(
          DisplayNameChangeInfoDtoBuilder? displayNameChangeInfo) =>
      _$this._displayNameChangeInfo = displayNameChangeInfo;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  DateTime? _updatedAt;
  DateTime? get updatedAt => _$this._updatedAt;
  set updatedAt(DateTime? updatedAt) => _$this._updatedAt = updatedAt;

  ProfileResponseDtoBuilder() {
    ProfileResponseDto._defaults(this);
  }

  ProfileResponseDtoBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _email = $v.email;
      _phone = $v.phone;
      _role = $v.role;
      _fullName = $v.fullName;
      _displayName = $v.displayName;
      _avatarUrl = $v.avatarUrl;
      _bio = $v.bio;
      _address = $v.address;
      _birthday = $v.birthday;
      _gender = $v.gender;
      _isVerified = $v.isVerified;
      _isActive = $v.isActive;
      _displayNameChangeInfo = $v.displayNameChangeInfo.toBuilder();
      _createdAt = $v.createdAt;
      _updatedAt = $v.updatedAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ProfileResponseDto other) {
    _$v = other as _$ProfileResponseDto;
  }

  @override
  void update(void Function(ProfileResponseDtoBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ProfileResponseDto build() => _build();

  _$ProfileResponseDto _build() {
    _$ProfileResponseDto _$result;
    try {
      _$result = _$v ??
          _$ProfileResponseDto._(
            id: BuiltValueNullFieldError.checkNotNull(
                id, r'ProfileResponseDto', 'id'),
            email: email,
            phone: phone,
            role: BuiltValueNullFieldError.checkNotNull(
                role, r'ProfileResponseDto', 'role'),
            fullName: fullName,
            displayName: displayName,
            avatarUrl: avatarUrl,
            bio: bio,
            address: address,
            birthday: birthday,
            gender: gender,
            isVerified: BuiltValueNullFieldError.checkNotNull(
                isVerified, r'ProfileResponseDto', 'isVerified'),
            isActive: BuiltValueNullFieldError.checkNotNull(
                isActive, r'ProfileResponseDto', 'isActive'),
            displayNameChangeInfo: displayNameChangeInfo.build(),
            createdAt: BuiltValueNullFieldError.checkNotNull(
                createdAt, r'ProfileResponseDto', 'createdAt'),
            updatedAt: BuiltValueNullFieldError.checkNotNull(
                updatedAt, r'ProfileResponseDto', 'updatedAt'),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'displayNameChangeInfo';
        displayNameChangeInfo.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'ProfileResponseDto', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
