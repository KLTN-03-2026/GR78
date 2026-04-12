// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'error_response_dto.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ErrorResponseDto extends ErrorResponseDto {
  @override
  final bool success;
  @override
  final num statusCode;
  @override
  final String code;
  @override
  final String message;
  @override
  final String path;
  @override
  final String timestamp;
  @override
  final JsonObject? details;

  factory _$ErrorResponseDto(
          [void Function(ErrorResponseDtoBuilder)? updates]) =>
      (ErrorResponseDtoBuilder()..update(updates))._build();

  _$ErrorResponseDto._(
      {required this.success,
      required this.statusCode,
      required this.code,
      required this.message,
      required this.path,
      required this.timestamp,
      this.details})
      : super._();
  @override
  ErrorResponseDto rebuild(void Function(ErrorResponseDtoBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ErrorResponseDtoBuilder toBuilder() =>
      ErrorResponseDtoBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ErrorResponseDto &&
        success == other.success &&
        statusCode == other.statusCode &&
        code == other.code &&
        message == other.message &&
        path == other.path &&
        timestamp == other.timestamp &&
        details == other.details;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, success.hashCode);
    _$hash = $jc(_$hash, statusCode.hashCode);
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, message.hashCode);
    _$hash = $jc(_$hash, path.hashCode);
    _$hash = $jc(_$hash, timestamp.hashCode);
    _$hash = $jc(_$hash, details.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ErrorResponseDto')
          ..add('success', success)
          ..add('statusCode', statusCode)
          ..add('code', code)
          ..add('message', message)
          ..add('path', path)
          ..add('timestamp', timestamp)
          ..add('details', details))
        .toString();
  }
}

class ErrorResponseDtoBuilder
    implements Builder<ErrorResponseDto, ErrorResponseDtoBuilder> {
  _$ErrorResponseDto? _$v;

  bool? _success;
  bool? get success => _$this._success;
  set success(bool? success) => _$this._success = success;

  num? _statusCode;
  num? get statusCode => _$this._statusCode;
  set statusCode(num? statusCode) => _$this._statusCode = statusCode;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  String? _message;
  String? get message => _$this._message;
  set message(String? message) => _$this._message = message;

  String? _path;
  String? get path => _$this._path;
  set path(String? path) => _$this._path = path;

  String? _timestamp;
  String? get timestamp => _$this._timestamp;
  set timestamp(String? timestamp) => _$this._timestamp = timestamp;

  JsonObject? _details;
  JsonObject? get details => _$this._details;
  set details(JsonObject? details) => _$this._details = details;

  ErrorResponseDtoBuilder() {
    ErrorResponseDto._defaults(this);
  }

  ErrorResponseDtoBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _success = $v.success;
      _statusCode = $v.statusCode;
      _code = $v.code;
      _message = $v.message;
      _path = $v.path;
      _timestamp = $v.timestamp;
      _details = $v.details;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ErrorResponseDto other) {
    _$v = other as _$ErrorResponseDto;
  }

  @override
  void update(void Function(ErrorResponseDtoBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ErrorResponseDto build() => _build();

  _$ErrorResponseDto _build() {
    final _$result = _$v ??
        _$ErrorResponseDto._(
          success: BuiltValueNullFieldError.checkNotNull(
              success, r'ErrorResponseDto', 'success'),
          statusCode: BuiltValueNullFieldError.checkNotNull(
              statusCode, r'ErrorResponseDto', 'statusCode'),
          code: BuiltValueNullFieldError.checkNotNull(
              code, r'ErrorResponseDto', 'code'),
          message: BuiltValueNullFieldError.checkNotNull(
              message, r'ErrorResponseDto', 'message'),
          path: BuiltValueNullFieldError.checkNotNull(
              path, r'ErrorResponseDto', 'path'),
          timestamp: BuiltValueNullFieldError.checkNotNull(
              timestamp, r'ErrorResponseDto', 'timestamp'),
          details: details,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
