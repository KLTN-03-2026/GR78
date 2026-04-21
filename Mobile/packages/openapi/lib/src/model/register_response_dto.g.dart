// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'register_response_dto.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$RegisterResponseDto extends RegisterResponseDto {
  @override
  final bool success;
  @override
  final String message;
  @override
  final RegisterResponseDataDto? data;

  factory _$RegisterResponseDto(
          [void Function(RegisterResponseDtoBuilder)? updates]) =>
      (RegisterResponseDtoBuilder()..update(updates))._build();

  _$RegisterResponseDto._(
      {required this.success, required this.message, this.data})
      : super._();
  @override
  RegisterResponseDto rebuild(
          void Function(RegisterResponseDtoBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  RegisterResponseDtoBuilder toBuilder() =>
      RegisterResponseDtoBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is RegisterResponseDto &&
        success == other.success &&
        message == other.message &&
        data == other.data;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, success.hashCode);
    _$hash = $jc(_$hash, message.hashCode);
    _$hash = $jc(_$hash, data.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'RegisterResponseDto')
          ..add('success', success)
          ..add('message', message)
          ..add('data', data))
        .toString();
  }
}

class RegisterResponseDtoBuilder
    implements Builder<RegisterResponseDto, RegisterResponseDtoBuilder> {
  _$RegisterResponseDto? _$v;

  bool? _success;
  bool? get success => _$this._success;
  set success(bool? success) => _$this._success = success;

  String? _message;
  String? get message => _$this._message;
  set message(String? message) => _$this._message = message;

  RegisterResponseDataDtoBuilder? _data;
  RegisterResponseDataDtoBuilder get data =>
      _$this._data ??= RegisterResponseDataDtoBuilder();
  set data(RegisterResponseDataDtoBuilder? data) => _$this._data = data;

  RegisterResponseDtoBuilder() {
    RegisterResponseDto._defaults(this);
  }

  RegisterResponseDtoBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _success = $v.success;
      _message = $v.message;
      _data = $v.data?.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(RegisterResponseDto other) {
    _$v = other as _$RegisterResponseDto;
  }

  @override
  void update(void Function(RegisterResponseDtoBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  RegisterResponseDto build() => _build();

  _$RegisterResponseDto _build() {
    _$RegisterResponseDto _$result;
    try {
      _$result = _$v ??
          _$RegisterResponseDto._(
            success: BuiltValueNullFieldError.checkNotNull(
                success, r'RegisterResponseDto', 'success'),
            message: BuiltValueNullFieldError.checkNotNull(
                message, r'RegisterResponseDto', 'message'),
            data: _data?.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'data';
        _data?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'RegisterResponseDto', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
