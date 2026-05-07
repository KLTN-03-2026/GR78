// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'login_mobile_dto.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$LoginMobileDto extends LoginMobileDto {
  @override
  final String identifier;
  @override
  final String password;

  factory _$LoginMobileDto([void Function(LoginMobileDtoBuilder)? updates]) =>
      (LoginMobileDtoBuilder()..update(updates))._build();

  _$LoginMobileDto._({required this.identifier, required this.password})
      : super._();
  @override
  LoginMobileDto rebuild(void Function(LoginMobileDtoBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  LoginMobileDtoBuilder toBuilder() => LoginMobileDtoBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is LoginMobileDto &&
        identifier == other.identifier &&
        password == other.password;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, identifier.hashCode);
    _$hash = $jc(_$hash, password.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'LoginMobileDto')
          ..add('identifier', identifier)
          ..add('password', password))
        .toString();
  }
}

class LoginMobileDtoBuilder
    implements Builder<LoginMobileDto, LoginMobileDtoBuilder> {
  _$LoginMobileDto? _$v;

  String? _identifier;
  String? get identifier => _$this._identifier;
  set identifier(String? identifier) => _$this._identifier = identifier;

  String? _password;
  String? get password => _$this._password;
  set password(String? password) => _$this._password = password;

  LoginMobileDtoBuilder() {
    LoginMobileDto._defaults(this);
  }

  LoginMobileDtoBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _identifier = $v.identifier;
      _password = $v.password;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(LoginMobileDto other) {
    _$v = other as _$LoginMobileDto;
  }

  @override
  void update(void Function(LoginMobileDtoBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  LoginMobileDto build() => _build();

  _$LoginMobileDto _build() {
    final _$result = _$v ??
        _$LoginMobileDto._(
          identifier: BuiltValueNullFieldError.checkNotNull(
              identifier, r'LoginMobileDto', 'identifier'),
          password: BuiltValueNullFieldError.checkNotNull(
              password, r'LoginMobileDto', 'password'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
