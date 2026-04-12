// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'feed_response_dto.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$FeedResponseDto extends FeedResponseDto {
  @override
  final BuiltList<PostResponseDto> data;
  @override
  final String? nextCursor;
  @override
  final num total;
  @override
  final bool hasMore;

  factory _$FeedResponseDto([void Function(FeedResponseDtoBuilder)? updates]) =>
      (FeedResponseDtoBuilder()..update(updates))._build();

  _$FeedResponseDto._(
      {required this.data,
      this.nextCursor,
      required this.total,
      required this.hasMore})
      : super._();
  @override
  FeedResponseDto rebuild(void Function(FeedResponseDtoBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  FeedResponseDtoBuilder toBuilder() => FeedResponseDtoBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is FeedResponseDto &&
        data == other.data &&
        nextCursor == other.nextCursor &&
        total == other.total &&
        hasMore == other.hasMore;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, data.hashCode);
    _$hash = $jc(_$hash, nextCursor.hashCode);
    _$hash = $jc(_$hash, total.hashCode);
    _$hash = $jc(_$hash, hasMore.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'FeedResponseDto')
          ..add('data', data)
          ..add('nextCursor', nextCursor)
          ..add('total', total)
          ..add('hasMore', hasMore))
        .toString();
  }
}

class FeedResponseDtoBuilder
    implements Builder<FeedResponseDto, FeedResponseDtoBuilder> {
  _$FeedResponseDto? _$v;

  ListBuilder<PostResponseDto>? _data;
  ListBuilder<PostResponseDto> get data =>
      _$this._data ??= ListBuilder<PostResponseDto>();
  set data(ListBuilder<PostResponseDto>? data) => _$this._data = data;

  String? _nextCursor;
  String? get nextCursor => _$this._nextCursor;
  set nextCursor(String? nextCursor) => _$this._nextCursor = nextCursor;

  num? _total;
  num? get total => _$this._total;
  set total(num? total) => _$this._total = total;

  bool? _hasMore;
  bool? get hasMore => _$this._hasMore;
  set hasMore(bool? hasMore) => _$this._hasMore = hasMore;

  FeedResponseDtoBuilder() {
    FeedResponseDto._defaults(this);
  }

  FeedResponseDtoBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _data = $v.data.toBuilder();
      _nextCursor = $v.nextCursor;
      _total = $v.total;
      _hasMore = $v.hasMore;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(FeedResponseDto other) {
    _$v = other as _$FeedResponseDto;
  }

  @override
  void update(void Function(FeedResponseDtoBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  FeedResponseDto build() => _build();

  _$FeedResponseDto _build() {
    _$FeedResponseDto _$result;
    try {
      _$result = _$v ??
          _$FeedResponseDto._(
            data: data.build(),
            nextCursor: nextCursor,
            total: BuiltValueNullFieldError.checkNotNull(
                total, r'FeedResponseDto', 'total'),
            hasMore: BuiltValueNullFieldError.checkNotNull(
                hasMore, r'FeedResponseDto', 'hasMore'),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'data';
        data.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'FeedResponseDto', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
