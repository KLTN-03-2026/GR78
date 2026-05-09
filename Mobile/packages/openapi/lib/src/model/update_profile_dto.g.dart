// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'update_profile_dto.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const UpdateProfileDtoGenderEnum _$updateProfileDtoGenderEnum_male =
    const UpdateProfileDtoGenderEnum._('male');
const UpdateProfileDtoGenderEnum _$updateProfileDtoGenderEnum_female =
    const UpdateProfileDtoGenderEnum._('female');
const UpdateProfileDtoGenderEnum _$updateProfileDtoGenderEnum_other =
    const UpdateProfileDtoGenderEnum._('other');

UpdateProfileDtoGenderEnum _$updateProfileDtoGenderEnumValueOf(String name) {
  switch (name) {
    case 'male':
      return _$updateProfileDtoGenderEnum_male;
    case 'female':
      return _$updateProfileDtoGenderEnum_female;
    case 'other':
      return _$updateProfileDtoGenderEnum_other;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<UpdateProfileDtoGenderEnum> _$updateProfileDtoGenderEnumValues =
    BuiltSet<UpdateProfileDtoGenderEnum>(const <UpdateProfileDtoGenderEnum>[
  _$updateProfileDtoGenderEnum_male,
  _$updateProfileDtoGenderEnum_female,
  _$updateProfileDtoGenderEnum_other,
]);

Serializer<UpdateProfileDtoGenderEnum> _$updateProfileDtoGenderEnumSerializer =
    _$UpdateProfileDtoGenderEnumSerializer();

class _$UpdateProfileDtoGenderEnumSerializer
    implements PrimitiveSerializer<UpdateProfileDtoGenderEnum> {
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
  final Iterable<Type> types = const <Type>[UpdateProfileDtoGenderEnum];
  @override
  final String wireName = 'UpdateProfileDtoGenderEnum';

  @override
  Object serialize(Serializers serializers, UpdateProfileDtoGenderEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  UpdateProfileDtoGenderEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      UpdateProfileDtoGenderEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$UpdateProfileDto extends UpdateProfileDto {
  @override
  final String? fullName;
  @override
  final String? avatarUrl;
  @override
  final String? bio;
  @override
  final String? address;
  @override
  final String? birthday;
  @override
  final UpdateProfileDtoGenderEnum? gender;
  @override
  final String? displayName;

  factory _$UpdateProfileDto(
          [void Function(UpdateProfileDtoBuilder)? updates]) =>
      (UpdateProfileDtoBuilder()..update(updates))._build();

  _$UpdateProfileDto._(
      {this.fullName,
      this.avatarUrl,
      this.bio,
      this.address,
      this.birthday,
      this.gender,
      this.displayName})
      : super._();
  @override
  UpdateProfileDto rebuild(void Function(UpdateProfileDtoBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  UpdateProfileDtoBuilder toBuilder() =>
      UpdateProfileDtoBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is UpdateProfileDto &&
        fullName == other.fullName &&
        avatarUrl == other.avatarUrl &&
        bio == other.bio &&
        address == other.address &&
        birthday == other.birthday &&
        gender == other.gender &&
        displayName == other.displayName;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, fullName.hashCode);
    _$hash = $jc(_$hash, avatarUrl.hashCode);
    _$hash = $jc(_$hash, bio.hashCode);
    _$hash = $jc(_$hash, address.hashCode);
    _$hash = $jc(_$hash, birthday.hashCode);
    _$hash = $jc(_$hash, gender.hashCode);
    _$hash = $jc(_$hash, displayName.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'UpdateProfileDto')
          ..add('fullName', fullName)
          ..add('avatarUrl', avatarUrl)
          ..add('bio', bio)
          ..add('address', address)
          ..add('birthday', birthday)
          ..add('gender', gender)
          ..add('displayName', displayName))
        .toString();
  }
}

class UpdateProfileDtoBuilder
    implements Builder<UpdateProfileDto, UpdateProfileDtoBuilder> {
  _$UpdateProfileDto? _$v;

  String? _fullName;
  String? get fullName => _$this._fullName;
  set fullName(String? fullName) => _$this._fullName = fullName;

  String? _avatarUrl;
  String? get avatarUrl => _$this._avatarUrl;
  set avatarUrl(String? avatarUrl) => _$this._avatarUrl = avatarUrl;

  String? _bio;
  String? get bio => _$this._bio;
  set bio(String? bio) => _$this._bio = bio;

  String? _address;
  String? get address => _$this._address;
  set address(String? address) => _$this._address = address;

  String? _birthday;
  String? get birthday => _$this._birthday;
  set birthday(String? birthday) => _$this._birthday = birthday;

  UpdateProfileDtoGenderEnum? _gender;
  UpdateProfileDtoGenderEnum? get gender => _$this._gender;
  set gender(UpdateProfileDtoGenderEnum? gender) => _$this._gender = gender;

  String? _displayName;
  String? get displayName => _$this._displayName;
  set displayName(String? displayName) => _$this._displayName = displayName;

  UpdateProfileDtoBuilder() {
    UpdateProfileDto._defaults(this);
  }

  UpdateProfileDtoBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _fullName = $v.fullName;
      _avatarUrl = $v.avatarUrl;
      _bio = $v.bio;
      _address = $v.address;
      _birthday = $v.birthday;
      _gender = $v.gender;
      _displayName = $v.displayName;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(UpdateProfileDto other) {
    _$v = other as _$UpdateProfileDto;
  }

  @override
  void update(void Function(UpdateProfileDtoBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  UpdateProfileDto build() => _build();

  _$UpdateProfileDto _build() {
    final _$result = _$v ??
        _$UpdateProfileDto._(
          fullName: fullName,
          avatarUrl: avatarUrl,
          bio: bio,
          address: address,
          birthday: birthday,
          gender: gender,
          displayName: displayName,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
