// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'display_name_change_info_dto.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$DisplayNameChangeInfoDto extends DisplayNameChangeInfoDto {
  @override
  final bool canChange;
  @override
  final DateTime? lastChanged;
  @override
  final num changeCount;
  @override
  final num daysUntilNextChange;

  factory _$DisplayNameChangeInfoDto(
          [void Function(DisplayNameChangeInfoDtoBuilder)? updates]) =>
      (DisplayNameChangeInfoDtoBuilder()..update(updates))._build();

  _$DisplayNameChangeInfoDto._(
      {required this.canChange,
      this.lastChanged,
      required this.changeCount,
      required this.daysUntilNextChange})
      : super._();
  @override
  DisplayNameChangeInfoDto rebuild(
          void Function(DisplayNameChangeInfoDtoBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  DisplayNameChangeInfoDtoBuilder toBuilder() =>
      DisplayNameChangeInfoDtoBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is DisplayNameChangeInfoDto &&
        canChange == other.canChange &&
        lastChanged == other.lastChanged &&
        changeCount == other.changeCount &&
        daysUntilNextChange == other.daysUntilNextChange;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, canChange.hashCode);
    _$hash = $jc(_$hash, lastChanged.hashCode);
    _$hash = $jc(_$hash, changeCount.hashCode);
    _$hash = $jc(_$hash, daysUntilNextChange.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'DisplayNameChangeInfoDto')
          ..add('canChange', canChange)
          ..add('lastChanged', lastChanged)
          ..add('changeCount', changeCount)
          ..add('daysUntilNextChange', daysUntilNextChange))
        .toString();
  }
}

class DisplayNameChangeInfoDtoBuilder
    implements
        Builder<DisplayNameChangeInfoDto, DisplayNameChangeInfoDtoBuilder> {
  _$DisplayNameChangeInfoDto? _$v;

  bool? _canChange;
  bool? get canChange => _$this._canChange;
  set canChange(bool? canChange) => _$this._canChange = canChange;

  DateTime? _lastChanged;
  DateTime? get lastChanged => _$this._lastChanged;
  set lastChanged(DateTime? lastChanged) => _$this._lastChanged = lastChanged;

  num? _changeCount;
  num? get changeCount => _$this._changeCount;
  set changeCount(num? changeCount) => _$this._changeCount = changeCount;

  num? _daysUntilNextChange;
  num? get daysUntilNextChange => _$this._daysUntilNextChange;
  set daysUntilNextChange(num? daysUntilNextChange) =>
      _$this._daysUntilNextChange = daysUntilNextChange;

  DisplayNameChangeInfoDtoBuilder() {
    DisplayNameChangeInfoDto._defaults(this);
  }

  DisplayNameChangeInfoDtoBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _canChange = $v.canChange;
      _lastChanged = $v.lastChanged;
      _changeCount = $v.changeCount;
      _daysUntilNextChange = $v.daysUntilNextChange;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(DisplayNameChangeInfoDto other) {
    _$v = other as _$DisplayNameChangeInfoDto;
  }

  @override
  void update(void Function(DisplayNameChangeInfoDtoBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  DisplayNameChangeInfoDto build() => _build();

  _$DisplayNameChangeInfoDto _build() {
    final _$result = _$v ??
        _$DisplayNameChangeInfoDto._(
          canChange: BuiltValueNullFieldError.checkNotNull(
              canChange, r'DisplayNameChangeInfoDto', 'canChange'),
          lastChanged: lastChanged,
          changeCount: BuiltValueNullFieldError.checkNotNull(
              changeCount, r'DisplayNameChangeInfoDto', 'changeCount'),
          daysUntilNextChange: BuiltValueNullFieldError.checkNotNull(
              daysUntilNextChange,
              r'DisplayNameChangeInfoDto',
              'daysUntilNextChange'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
