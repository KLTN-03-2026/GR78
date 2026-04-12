// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'reject_quote_dto.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$RejectQuoteDto extends RejectQuoteDto {
  @override
  final String? reason;

  factory _$RejectQuoteDto([void Function(RejectQuoteDtoBuilder)? updates]) =>
      (RejectQuoteDtoBuilder()..update(updates))._build();

  _$RejectQuoteDto._({this.reason}) : super._();
  @override
  RejectQuoteDto rebuild(void Function(RejectQuoteDtoBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  RejectQuoteDtoBuilder toBuilder() => RejectQuoteDtoBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is RejectQuoteDto && reason == other.reason;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'RejectQuoteDto')
          ..add('reason', reason))
        .toString();
  }
}

class RejectQuoteDtoBuilder
    implements Builder<RejectQuoteDto, RejectQuoteDtoBuilder> {
  _$RejectQuoteDto? _$v;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  RejectQuoteDtoBuilder() {
    RejectQuoteDto._defaults(this);
  }

  RejectQuoteDtoBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _reason = $v.reason;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(RejectQuoteDto other) {
    _$v = other as _$RejectQuoteDto;
  }

  @override
  void update(void Function(RejectQuoteDtoBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  RejectQuoteDto build() => _build();

  _$RejectQuoteDto _build() {
    final _$result = _$v ??
        _$RejectQuoteDto._(
          reason: reason,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
