// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'login_response_data_dto.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$LoginResponseDataDto extends LoginResponseDataDto {
  @override
  final String accessToken;
  @override
  final String refreshToken;
  @override
  final JsonObject user;

  factory _$LoginResponseDataDto(
          [void Function(LoginResponseDataDtoBuilder)? updates]) =>
      (LoginResponseDataDtoBuilder()..update(updates))._build();

  _$LoginResponseDataDto._(
      {required this.accessToken,
      required this.refreshToken,
      required this.user})
      : super._();
  @override
  LoginResponseDataDto rebuild(
          void Function(LoginResponseDataDtoBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  LoginResponseDataDtoBuilder toBuilder() =>
      LoginResponseDataDtoBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is LoginResponseDataDto &&
        accessToken == other.accessToken &&
        refreshToken == other.refreshToken &&
        user == other.user;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, accessToken.hashCode);
    _$hash = $jc(_$hash, refreshToken.hashCode);
    _$hash = $jc(_$hash, user.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'LoginResponseDataDto')
          ..add('accessToken', accessToken)
          ..add('refreshToken', refreshToken)
          ..add('user', user))
        .toString();
  }
}

class LoginResponseDataDtoBuilder
    implements Builder<LoginResponseDataDto, LoginResponseDataDtoBuilder> {
  _$LoginResponseDataDto? _$v;

  String? _accessToken;
  String? get accessToken => _$this._accessToken;
  set accessToken(String? accessToken) => _$this._accessToken = accessToken;

  String? _refreshToken;
  String? get refreshToken => _$this._refreshToken;
  set refreshToken(String? refreshToken) => _$this._refreshToken = refreshToken;

  JsonObject? _user;
  JsonObject? get user => _$this._user;
  set user(JsonObject? user) => _$this._user = user;

  LoginResponseDataDtoBuilder() {
    LoginResponseDataDto._defaults(this);
  }

  LoginResponseDataDtoBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _accessToken = $v.accessToken;
      _refreshToken = $v.refreshToken;
      _user = $v.user;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(LoginResponseDataDto other) {
    _$v = other as _$LoginResponseDataDto;
  }

  @override
  void update(void Function(LoginResponseDataDtoBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  LoginResponseDataDto build() => _build();

  _$LoginResponseDataDto _build() {
    final _$result = _$v ??
        _$LoginResponseDataDto._(
          accessToken: BuiltValueNullFieldError.checkNotNull(
              accessToken, r'LoginResponseDataDto', 'accessToken'),
          refreshToken: BuiltValueNullFieldError.checkNotNull(
              refreshToken, r'LoginResponseDataDto', 'refreshToken'),
          user: BuiltValueNullFieldError.checkNotNull(
              user, r'LoginResponseDataDto', 'user'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
