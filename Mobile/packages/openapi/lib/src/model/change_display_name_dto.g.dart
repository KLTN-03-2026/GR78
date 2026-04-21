// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'change_display_name_dto.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ChangeDisplayNameDto extends ChangeDisplayNameDto {
  @override
  final String displayName;

  factory _$ChangeDisplayNameDto(
          [void Function(ChangeDisplayNameDtoBuilder)? updates]) =>
      (ChangeDisplayNameDtoBuilder()..update(updates))._build();

  _$ChangeDisplayNameDto._({required this.displayName}) : super._();
  @override
  ChangeDisplayNameDto rebuild(
          void Function(ChangeDisplayNameDtoBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ChangeDisplayNameDtoBuilder toBuilder() =>
      ChangeDisplayNameDtoBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ChangeDisplayNameDto && displayName == other.displayName;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, displayName.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ChangeDisplayNameDto')
          ..add('displayName', displayName))
        .toString();
  }
}

class ChangeDisplayNameDtoBuilder
    implements Builder<ChangeDisplayNameDto, ChangeDisplayNameDtoBuilder> {
  _$ChangeDisplayNameDto? _$v;

  String? _displayName;
  String? get displayName => _$this._displayName;
  set displayName(String? displayName) => _$this._displayName = displayName;

  ChangeDisplayNameDtoBuilder() {
    ChangeDisplayNameDto._defaults(this);
  }

  ChangeDisplayNameDtoBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _displayName = $v.displayName;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ChangeDisplayNameDto other) {
    _$v = other as _$ChangeDisplayNameDto;
  }

  @override
  void update(void Function(ChangeDisplayNameDtoBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ChangeDisplayNameDto build() => _build();

  _$ChangeDisplayNameDto _build() {
    final _$result = _$v ??
        _$ChangeDisplayNameDto._(
          displayName: BuiltValueNullFieldError.checkNotNull(
              displayName, r'ChangeDisplayNameDto', 'displayName'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
