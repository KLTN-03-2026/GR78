// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'update_avatar_dto.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$UpdateAvatarDto extends UpdateAvatarDto {
  @override
  final String avatarUrl;

  factory _$UpdateAvatarDto([void Function(UpdateAvatarDtoBuilder)? updates]) =>
      (UpdateAvatarDtoBuilder()..update(updates))._build();

  _$UpdateAvatarDto._({required this.avatarUrl}) : super._();
  @override
  UpdateAvatarDto rebuild(void Function(UpdateAvatarDtoBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  UpdateAvatarDtoBuilder toBuilder() => UpdateAvatarDtoBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is UpdateAvatarDto && avatarUrl == other.avatarUrl;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, avatarUrl.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'UpdateAvatarDto')
          ..add('avatarUrl', avatarUrl))
        .toString();
  }
}

class UpdateAvatarDtoBuilder
    implements Builder<UpdateAvatarDto, UpdateAvatarDtoBuilder> {
  _$UpdateAvatarDto? _$v;

  String? _avatarUrl;
  String? get avatarUrl => _$this._avatarUrl;
  set avatarUrl(String? avatarUrl) => _$this._avatarUrl = avatarUrl;

  UpdateAvatarDtoBuilder() {
    UpdateAvatarDto._defaults(this);
  }

  UpdateAvatarDtoBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _avatarUrl = $v.avatarUrl;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(UpdateAvatarDto other) {
    _$v = other as _$UpdateAvatarDto;
  }

  @override
  void update(void Function(UpdateAvatarDtoBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  UpdateAvatarDto build() => _build();

  _$UpdateAvatarDto _build() {
    final _$result = _$v ??
        _$UpdateAvatarDto._(
          avatarUrl: BuiltValueNullFieldError.checkNotNull(
              avatarUrl, r'UpdateAvatarDto', 'avatarUrl'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
