// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'delete_account_response_dto.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$DeleteAccountResponseDto extends DeleteAccountResponseDto {
  @override
  final bool success;
  @override
  final String message;

  factory _$DeleteAccountResponseDto(
          [void Function(DeleteAccountResponseDtoBuilder)? updates]) =>
      (DeleteAccountResponseDtoBuilder()..update(updates))._build();

  _$DeleteAccountResponseDto._({required this.success, required this.message})
      : super._();
  @override
  DeleteAccountResponseDto rebuild(
          void Function(DeleteAccountResponseDtoBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  DeleteAccountResponseDtoBuilder toBuilder() =>
      DeleteAccountResponseDtoBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is DeleteAccountResponseDto &&
        success == other.success &&
        message == other.message;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, success.hashCode);
    _$hash = $jc(_$hash, message.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'DeleteAccountResponseDto')
          ..add('success', success)
          ..add('message', message))
        .toString();
  }
}

class DeleteAccountResponseDtoBuilder
    implements
        Builder<DeleteAccountResponseDto, DeleteAccountResponseDtoBuilder> {
  _$DeleteAccountResponseDto? _$v;

  bool? _success;
  bool? get success => _$this._success;
  set success(bool? success) => _$this._success = success;

  String? _message;
  String? get message => _$this._message;
  set message(String? message) => _$this._message = message;

  DeleteAccountResponseDtoBuilder() {
    DeleteAccountResponseDto._defaults(this);
  }

  DeleteAccountResponseDtoBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _success = $v.success;
      _message = $v.message;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(DeleteAccountResponseDto other) {
    _$v = other as _$DeleteAccountResponseDto;
  }

  @override
  void update(void Function(DeleteAccountResponseDtoBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  DeleteAccountResponseDto build() => _build();

  _$DeleteAccountResponseDto _build() {
    final _$result = _$v ??
        _$DeleteAccountResponseDto._(
          success: BuiltValueNullFieldError.checkNotNull(
              success, r'DeleteAccountResponseDto', 'success'),
          message: BuiltValueNullFieldError.checkNotNull(
              message, r'DeleteAccountResponseDto', 'message'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
