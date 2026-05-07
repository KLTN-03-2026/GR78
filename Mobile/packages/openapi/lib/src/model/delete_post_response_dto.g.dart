// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'delete_post_response_dto.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$DeletePostResponseDto extends DeletePostResponseDto {
  @override
  final bool success;
  @override
  final String message;
  @override
  final String postId;

  factory _$DeletePostResponseDto(
          [void Function(DeletePostResponseDtoBuilder)? updates]) =>
      (DeletePostResponseDtoBuilder()..update(updates))._build();

  _$DeletePostResponseDto._(
      {required this.success, required this.message, required this.postId})
      : super._();
  @override
  DeletePostResponseDto rebuild(
          void Function(DeletePostResponseDtoBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  DeletePostResponseDtoBuilder toBuilder() =>
      DeletePostResponseDtoBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is DeletePostResponseDto &&
        success == other.success &&
        message == other.message &&
        postId == other.postId;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, success.hashCode);
    _$hash = $jc(_$hash, message.hashCode);
    _$hash = $jc(_$hash, postId.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'DeletePostResponseDto')
          ..add('success', success)
          ..add('message', message)
          ..add('postId', postId))
        .toString();
  }
}

class DeletePostResponseDtoBuilder
    implements Builder<DeletePostResponseDto, DeletePostResponseDtoBuilder> {
  _$DeletePostResponseDto? _$v;

  bool? _success;
  bool? get success => _$this._success;
  set success(bool? success) => _$this._success = success;

  String? _message;
  String? get message => _$this._message;
  set message(String? message) => _$this._message = message;

  String? _postId;
  String? get postId => _$this._postId;
  set postId(String? postId) => _$this._postId = postId;

  DeletePostResponseDtoBuilder() {
    DeletePostResponseDto._defaults(this);
  }

  DeletePostResponseDtoBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _success = $v.success;
      _message = $v.message;
      _postId = $v.postId;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(DeletePostResponseDto other) {
    _$v = other as _$DeletePostResponseDto;
  }

  @override
  void update(void Function(DeletePostResponseDtoBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  DeletePostResponseDto build() => _build();

  _$DeletePostResponseDto _build() {
    final _$result = _$v ??
        _$DeletePostResponseDto._(
          success: BuiltValueNullFieldError.checkNotNull(
              success, r'DeletePostResponseDto', 'success'),
          message: BuiltValueNullFieldError.checkNotNull(
              message, r'DeletePostResponseDto', 'message'),
          postId: BuiltValueNullFieldError.checkNotNull(
              postId, r'DeletePostResponseDto', 'postId'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
