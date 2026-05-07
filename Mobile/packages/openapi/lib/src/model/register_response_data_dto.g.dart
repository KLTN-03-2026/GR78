// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'register_response_data_dto.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$RegisterResponseDataDto extends RegisterResponseDataDto {
  @override
  final String id;
  @override
  final String? email;
  @override
  final String? phone;
  @override
  final String? fullName;

  factory _$RegisterResponseDataDto(
          [void Function(RegisterResponseDataDtoBuilder)? updates]) =>
      (RegisterResponseDataDtoBuilder()..update(updates))._build();

  _$RegisterResponseDataDto._(
      {required this.id, this.email, this.phone, this.fullName})
      : super._();
  @override
  RegisterResponseDataDto rebuild(
          void Function(RegisterResponseDataDtoBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  RegisterResponseDataDtoBuilder toBuilder() =>
      RegisterResponseDataDtoBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is RegisterResponseDataDto &&
        id == other.id &&
        email == other.email &&
        phone == other.phone &&
        fullName == other.fullName;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, email.hashCode);
    _$hash = $jc(_$hash, phone.hashCode);
    _$hash = $jc(_$hash, fullName.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'RegisterResponseDataDto')
          ..add('id', id)
          ..add('email', email)
          ..add('phone', phone)
          ..add('fullName', fullName))
        .toString();
  }
}

class RegisterResponseDataDtoBuilder
    implements
        Builder<RegisterResponseDataDto, RegisterResponseDataDtoBuilder> {
  _$RegisterResponseDataDto? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _email;
  String? get email => _$this._email;
  set email(String? email) => _$this._email = email;

  String? _phone;
  String? get phone => _$this._phone;
  set phone(String? phone) => _$this._phone = phone;

  String? _fullName;
  String? get fullName => _$this._fullName;
  set fullName(String? fullName) => _$this._fullName = fullName;

  RegisterResponseDataDtoBuilder() {
    RegisterResponseDataDto._defaults(this);
  }

  RegisterResponseDataDtoBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _email = $v.email;
      _phone = $v.phone;
      _fullName = $v.fullName;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(RegisterResponseDataDto other) {
    _$v = other as _$RegisterResponseDataDto;
  }

  @override
  void update(void Function(RegisterResponseDataDtoBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  RegisterResponseDataDto build() => _build();

  _$RegisterResponseDataDto _build() {
    final _$result = _$v ??
        _$RegisterResponseDataDto._(
          id: BuiltValueNullFieldError.checkNotNull(
              id, r'RegisterResponseDataDto', 'id'),
          email: email,
          phone: phone,
          fullName: fullName,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
