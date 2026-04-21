// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'display_name_change_response_dto.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$DisplayNameChangeResponseDto extends DisplayNameChangeResponseDto {
  @override
  final bool success;
  @override
  final String message;
  @override
  final String newDisplayName;
  @override
  final DateTime changedAt;
  @override
  final num daysUntilNextChange;

  factory _$DisplayNameChangeResponseDto(
          [void Function(DisplayNameChangeResponseDtoBuilder)? updates]) =>
      (DisplayNameChangeResponseDtoBuilder()..update(updates))._build();

  _$DisplayNameChangeResponseDto._(
      {required this.success,
      required this.message,
      required this.newDisplayName,
      required this.changedAt,
      required this.daysUntilNextChange})
      : super._();
  @override
  DisplayNameChangeResponseDto rebuild(
          void Function(DisplayNameChangeResponseDtoBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  DisplayNameChangeResponseDtoBuilder toBuilder() =>
      DisplayNameChangeResponseDtoBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is DisplayNameChangeResponseDto &&
        success == other.success &&
        message == other.message &&
        newDisplayName == other.newDisplayName &&
        changedAt == other.changedAt &&
        daysUntilNextChange == other.daysUntilNextChange;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, success.hashCode);
    _$hash = $jc(_$hash, message.hashCode);
    _$hash = $jc(_$hash, newDisplayName.hashCode);
    _$hash = $jc(_$hash, changedAt.hashCode);
    _$hash = $jc(_$hash, daysUntilNextChange.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'DisplayNameChangeResponseDto')
          ..add('success', success)
          ..add('message', message)
          ..add('newDisplayName', newDisplayName)
          ..add('changedAt', changedAt)
          ..add('daysUntilNextChange', daysUntilNextChange))
        .toString();
  }
}

class DisplayNameChangeResponseDtoBuilder
    implements
        Builder<DisplayNameChangeResponseDto,
            DisplayNameChangeResponseDtoBuilder> {
  _$DisplayNameChangeResponseDto? _$v;

  bool? _success;
  bool? get success => _$this._success;
  set success(bool? success) => _$this._success = success;

  String? _message;
  String? get message => _$this._message;
  set message(String? message) => _$this._message = message;

  String? _newDisplayName;
  String? get newDisplayName => _$this._newDisplayName;
  set newDisplayName(String? newDisplayName) =>
      _$this._newDisplayName = newDisplayName;

  DateTime? _changedAt;
  DateTime? get changedAt => _$this._changedAt;
  set changedAt(DateTime? changedAt) => _$this._changedAt = changedAt;

  num? _daysUntilNextChange;
  num? get daysUntilNextChange => _$this._daysUntilNextChange;
  set daysUntilNextChange(num? daysUntilNextChange) =>
      _$this._daysUntilNextChange = daysUntilNextChange;

  DisplayNameChangeResponseDtoBuilder() {
    DisplayNameChangeResponseDto._defaults(this);
  }

  DisplayNameChangeResponseDtoBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _success = $v.success;
      _message = $v.message;
      _newDisplayName = $v.newDisplayName;
      _changedAt = $v.changedAt;
      _daysUntilNextChange = $v.daysUntilNextChange;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(DisplayNameChangeResponseDto other) {
    _$v = other as _$DisplayNameChangeResponseDto;
  }

  @override
  void update(void Function(DisplayNameChangeResponseDtoBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  DisplayNameChangeResponseDto build() => _build();

  _$DisplayNameChangeResponseDto _build() {
    final _$result = _$v ??
        _$DisplayNameChangeResponseDto._(
          success: BuiltValueNullFieldError.checkNotNull(
              success, r'DisplayNameChangeResponseDto', 'success'),
          message: BuiltValueNullFieldError.checkNotNull(
              message, r'DisplayNameChangeResponseDto', 'message'),
          newDisplayName: BuiltValueNullFieldError.checkNotNull(newDisplayName,
              r'DisplayNameChangeResponseDto', 'newDisplayName'),
          changedAt: BuiltValueNullFieldError.checkNotNull(
              changedAt, r'DisplayNameChangeResponseDto', 'changedAt'),
          daysUntilNextChange: BuiltValueNullFieldError.checkNotNull(
              daysUntilNextChange,
              r'DisplayNameChangeResponseDto',
              'daysUntilNextChange'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
