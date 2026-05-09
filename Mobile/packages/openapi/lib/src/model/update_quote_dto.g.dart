// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'update_quote_dto.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$UpdateQuoteDto extends UpdateQuoteDto {
  @override
  final num? price;
  @override
  final String? description;
  @override
  final String? terms;
  @override
  final num? estimatedDuration;
  @override
  final BuiltList<String>? imageUrls;

  factory _$UpdateQuoteDto([void Function(UpdateQuoteDtoBuilder)? updates]) =>
      (UpdateQuoteDtoBuilder()..update(updates))._build();

  _$UpdateQuoteDto._(
      {this.price,
      this.description,
      this.terms,
      this.estimatedDuration,
      this.imageUrls})
      : super._();
  @override
  UpdateQuoteDto rebuild(void Function(UpdateQuoteDtoBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  UpdateQuoteDtoBuilder toBuilder() => UpdateQuoteDtoBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is UpdateQuoteDto &&
        price == other.price &&
        description == other.description &&
        terms == other.terms &&
        estimatedDuration == other.estimatedDuration &&
        imageUrls == other.imageUrls;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, price.hashCode);
    _$hash = $jc(_$hash, description.hashCode);
    _$hash = $jc(_$hash, terms.hashCode);
    _$hash = $jc(_$hash, estimatedDuration.hashCode);
    _$hash = $jc(_$hash, imageUrls.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'UpdateQuoteDto')
          ..add('price', price)
          ..add('description', description)
          ..add('terms', terms)
          ..add('estimatedDuration', estimatedDuration)
          ..add('imageUrls', imageUrls))
        .toString();
  }
}

class UpdateQuoteDtoBuilder
    implements Builder<UpdateQuoteDto, UpdateQuoteDtoBuilder> {
  _$UpdateQuoteDto? _$v;

  num? _price;
  num? get price => _$this._price;
  set price(num? price) => _$this._price = price;

  String? _description;
  String? get description => _$this._description;
  set description(String? description) => _$this._description = description;

  String? _terms;
  String? get terms => _$this._terms;
  set terms(String? terms) => _$this._terms = terms;

  num? _estimatedDuration;
  num? get estimatedDuration => _$this._estimatedDuration;
  set estimatedDuration(num? estimatedDuration) =>
      _$this._estimatedDuration = estimatedDuration;

  ListBuilder<String>? _imageUrls;
  ListBuilder<String> get imageUrls =>
      _$this._imageUrls ??= ListBuilder<String>();
  set imageUrls(ListBuilder<String>? imageUrls) =>
      _$this._imageUrls = imageUrls;

  UpdateQuoteDtoBuilder() {
    UpdateQuoteDto._defaults(this);
  }

  UpdateQuoteDtoBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _price = $v.price;
      _description = $v.description;
      _terms = $v.terms;
      _estimatedDuration = $v.estimatedDuration;
      _imageUrls = $v.imageUrls?.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(UpdateQuoteDto other) {
    _$v = other as _$UpdateQuoteDto;
  }

  @override
  void update(void Function(UpdateQuoteDtoBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  UpdateQuoteDto build() => _build();

  _$UpdateQuoteDto _build() {
    _$UpdateQuoteDto _$result;
    try {
      _$result = _$v ??
          _$UpdateQuoteDto._(
            price: price,
            description: description,
            terms: terms,
            estimatedDuration: estimatedDuration,
            imageUrls: _imageUrls?.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'imageUrls';
        _imageUrls?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'UpdateQuoteDto', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
