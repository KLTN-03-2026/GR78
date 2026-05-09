// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'create_post_dto.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CreatePostDto extends CreatePostDto {
  @override
  final String title;
  @override
  final String description;
  @override
  final BuiltList<String>? imageUrls;
  @override
  final String? location;
  @override
  final DateTime? desiredTime;
  @override
  final num? budget;

  factory _$CreatePostDto([void Function(CreatePostDtoBuilder)? updates]) =>
      (CreatePostDtoBuilder()..update(updates))._build();

  _$CreatePostDto._(
      {required this.title,
      required this.description,
      this.imageUrls,
      this.location,
      this.desiredTime,
      this.budget})
      : super._();
  @override
  CreatePostDto rebuild(void Function(CreatePostDtoBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  CreatePostDtoBuilder toBuilder() => CreatePostDtoBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CreatePostDto &&
        title == other.title &&
        description == other.description &&
        imageUrls == other.imageUrls &&
        location == other.location &&
        desiredTime == other.desiredTime &&
        budget == other.budget;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, title.hashCode);
    _$hash = $jc(_$hash, description.hashCode);
    _$hash = $jc(_$hash, imageUrls.hashCode);
    _$hash = $jc(_$hash, location.hashCode);
    _$hash = $jc(_$hash, desiredTime.hashCode);
    _$hash = $jc(_$hash, budget.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CreatePostDto')
          ..add('title', title)
          ..add('description', description)
          ..add('imageUrls', imageUrls)
          ..add('location', location)
          ..add('desiredTime', desiredTime)
          ..add('budget', budget))
        .toString();
  }
}

class CreatePostDtoBuilder
    implements Builder<CreatePostDto, CreatePostDtoBuilder> {
  _$CreatePostDto? _$v;

  String? _title;
  String? get title => _$this._title;
  set title(String? title) => _$this._title = title;

  String? _description;
  String? get description => _$this._description;
  set description(String? description) => _$this._description = description;

  ListBuilder<String>? _imageUrls;
  ListBuilder<String> get imageUrls =>
      _$this._imageUrls ??= ListBuilder<String>();
  set imageUrls(ListBuilder<String>? imageUrls) =>
      _$this._imageUrls = imageUrls;

  String? _location;
  String? get location => _$this._location;
  set location(String? location) => _$this._location = location;

  DateTime? _desiredTime;
  DateTime? get desiredTime => _$this._desiredTime;
  set desiredTime(DateTime? desiredTime) => _$this._desiredTime = desiredTime;

  num? _budget;
  num? get budget => _$this._budget;
  set budget(num? budget) => _$this._budget = budget;

  CreatePostDtoBuilder() {
    CreatePostDto._defaults(this);
  }

  CreatePostDtoBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _title = $v.title;
      _description = $v.description;
      _imageUrls = $v.imageUrls?.toBuilder();
      _location = $v.location;
      _desiredTime = $v.desiredTime;
      _budget = $v.budget;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CreatePostDto other) {
    _$v = other as _$CreatePostDto;
  }

  @override
  void update(void Function(CreatePostDtoBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CreatePostDto build() => _build();

  _$CreatePostDto _build() {
    _$CreatePostDto _$result;
    try {
      _$result = _$v ??
          _$CreatePostDto._(
            title: BuiltValueNullFieldError.checkNotNull(
                title, r'CreatePostDto', 'title'),
            description: BuiltValueNullFieldError.checkNotNull(
                description, r'CreatePostDto', 'description'),
            imageUrls: _imageUrls?.build(),
            location: location,
            desiredTime: desiredTime,
            budget: budget,
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'imageUrls';
        _imageUrls?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'CreatePostDto', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
