// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'create_quote_dto.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CreateQuoteDto extends CreateQuoteDto {
  @override
  final String postId;
  @override
  final num price;
  @override
  final String description;
  @override
  final String? terms;
  @override
  final num? estimatedDuration;
  @override
  final BuiltList<String>? imageUrls;

  factory _$CreateQuoteDto([void Function(CreateQuoteDtoBuilder)? updates]) =>
      (CreateQuoteDtoBuilder()..update(updates))._build();

  _$CreateQuoteDto._(
      {required this.postId,
      required this.price,
      required this.description,
      this.terms,
      this.estimatedDuration,
      this.imageUrls})
      : super._();
  @override
  CreateQuoteDto rebuild(void Function(CreateQuoteDtoBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  CreateQuoteDtoBuilder toBuilder() => CreateQuoteDtoBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CreateQuoteDto &&
        postId == other.postId &&
        price == other.price &&
        description == other.description &&
        terms == other.terms &&
        estimatedDuration == other.estimatedDuration &&
        imageUrls == other.imageUrls;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, postId.hashCode);
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
    return (newBuiltValueToStringHelper(r'CreateQuoteDto')
          ..add('postId', postId)
          ..add('price', price)
          ..add('description', description)
          ..add('terms', terms)
          ..add('estimatedDuration', estimatedDuration)
          ..add('imageUrls', imageUrls))
        .toString();
  }
}

class CreateQuoteDtoBuilder
    implements Builder<CreateQuoteDto, CreateQuoteDtoBuilder> {
  _$CreateQuoteDto? _$v;

  String? _postId;
  String? get postId => _$this._postId;
  set postId(String? postId) => _$this._postId = postId;

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

  CreateQuoteDtoBuilder() {
    CreateQuoteDto._defaults(this);
  }

  CreateQuoteDtoBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _postId = $v.postId;
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
  void replace(CreateQuoteDto other) {
    _$v = other as _$CreateQuoteDto;
  }

  @override
  void update(void Function(CreateQuoteDtoBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CreateQuoteDto build() => _build();

  _$CreateQuoteDto _build() {
    _$CreateQuoteDto _$result;
    try {
      _$result = _$v ??
          _$CreateQuoteDto._(
            postId: BuiltValueNullFieldError.checkNotNull(
                postId, r'CreateQuoteDto', 'postId'),
            price: BuiltValueNullFieldError.checkNotNull(
                price, r'CreateQuoteDto', 'price'),
            description: BuiltValueNullFieldError.checkNotNull(
                description, r'CreateQuoteDto', 'description'),
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
            r'CreateQuoteDto', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
