// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'update_post_dto.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const UpdatePostDtoStatusEnum _$updatePostDtoStatusEnum_OPEN =
    const UpdatePostDtoStatusEnum._('OPEN');
const UpdatePostDtoStatusEnum _$updatePostDtoStatusEnum_CLOSED =
    const UpdatePostDtoStatusEnum._('CLOSED');

UpdatePostDtoStatusEnum _$updatePostDtoStatusEnumValueOf(String name) {
  switch (name) {
    case 'OPEN':
      return _$updatePostDtoStatusEnum_OPEN;
    case 'CLOSED':
      return _$updatePostDtoStatusEnum_CLOSED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<UpdatePostDtoStatusEnum> _$updatePostDtoStatusEnumValues =
    BuiltSet<UpdatePostDtoStatusEnum>(const <UpdatePostDtoStatusEnum>[
  _$updatePostDtoStatusEnum_OPEN,
  _$updatePostDtoStatusEnum_CLOSED,
]);

Serializer<UpdatePostDtoStatusEnum> _$updatePostDtoStatusEnumSerializer =
    _$UpdatePostDtoStatusEnumSerializer();

class _$UpdatePostDtoStatusEnumSerializer
    implements PrimitiveSerializer<UpdatePostDtoStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'OPEN': 'OPEN',
    'CLOSED': 'CLOSED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'OPEN': 'OPEN',
    'CLOSED': 'CLOSED',
  };

  @override
  final Iterable<Type> types = const <Type>[UpdatePostDtoStatusEnum];
  @override
  final String wireName = 'UpdatePostDtoStatusEnum';

  @override
  Object serialize(Serializers serializers, UpdatePostDtoStatusEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  UpdatePostDtoStatusEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      UpdatePostDtoStatusEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$UpdatePostDto extends UpdatePostDto {
  @override
  final String? title;
  @override
  final String? description;
  @override
  final BuiltList<String>? imageUrls;
  @override
  final String? location;
  @override
  final DateTime? desiredTime;
  @override
  final num? budget;
  @override
  final UpdatePostDtoStatusEnum? status;

  factory _$UpdatePostDto([void Function(UpdatePostDtoBuilder)? updates]) =>
      (UpdatePostDtoBuilder()..update(updates))._build();

  _$UpdatePostDto._(
      {this.title,
      this.description,
      this.imageUrls,
      this.location,
      this.desiredTime,
      this.budget,
      this.status})
      : super._();
  @override
  UpdatePostDto rebuild(void Function(UpdatePostDtoBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  UpdatePostDtoBuilder toBuilder() => UpdatePostDtoBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is UpdatePostDto &&
        title == other.title &&
        description == other.description &&
        imageUrls == other.imageUrls &&
        location == other.location &&
        desiredTime == other.desiredTime &&
        budget == other.budget &&
        status == other.status;
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
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'UpdatePostDto')
          ..add('title', title)
          ..add('description', description)
          ..add('imageUrls', imageUrls)
          ..add('location', location)
          ..add('desiredTime', desiredTime)
          ..add('budget', budget)
          ..add('status', status))
        .toString();
  }
}

class UpdatePostDtoBuilder
    implements Builder<UpdatePostDto, UpdatePostDtoBuilder> {
  _$UpdatePostDto? _$v;

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

  UpdatePostDtoStatusEnum? _status;
  UpdatePostDtoStatusEnum? get status => _$this._status;
  set status(UpdatePostDtoStatusEnum? status) => _$this._status = status;

  UpdatePostDtoBuilder() {
    UpdatePostDto._defaults(this);
  }

  UpdatePostDtoBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _title = $v.title;
      _description = $v.description;
      _imageUrls = $v.imageUrls?.toBuilder();
      _location = $v.location;
      _desiredTime = $v.desiredTime;
      _budget = $v.budget;
      _status = $v.status;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(UpdatePostDto other) {
    _$v = other as _$UpdatePostDto;
  }

  @override
  void update(void Function(UpdatePostDtoBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  UpdatePostDto build() => _build();

  _$UpdatePostDto _build() {
    _$UpdatePostDto _$result;
    try {
      _$result = _$v ??
          _$UpdatePostDto._(
            title: title,
            description: description,
            imageUrls: _imageUrls?.build(),
            location: location,
            desiredTime: desiredTime,
            budget: budget,
            status: status,
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'imageUrls';
        _imageUrls?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'UpdatePostDto', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
