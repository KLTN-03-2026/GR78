// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'post_response_dto.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const PostResponseDtoStatusEnum _$postResponseDtoStatusEnum_OPEN =
    const PostResponseDtoStatusEnum._('OPEN');
const PostResponseDtoStatusEnum _$postResponseDtoStatusEnum_CLOSED =
    const PostResponseDtoStatusEnum._('CLOSED');

PostResponseDtoStatusEnum _$postResponseDtoStatusEnumValueOf(String name) {
  switch (name) {
    case 'OPEN':
      return _$postResponseDtoStatusEnum_OPEN;
    case 'CLOSED':
      return _$postResponseDtoStatusEnum_CLOSED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<PostResponseDtoStatusEnum> _$postResponseDtoStatusEnumValues =
    BuiltSet<PostResponseDtoStatusEnum>(const <PostResponseDtoStatusEnum>[
  _$postResponseDtoStatusEnum_OPEN,
  _$postResponseDtoStatusEnum_CLOSED,
]);

Serializer<PostResponseDtoStatusEnum> _$postResponseDtoStatusEnumSerializer =
    _$PostResponseDtoStatusEnumSerializer();

class _$PostResponseDtoStatusEnumSerializer
    implements PrimitiveSerializer<PostResponseDtoStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'OPEN': 'OPEN',
    'CLOSED': 'CLOSED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'OPEN': 'OPEN',
    'CLOSED': 'CLOSED',
  };

  @override
  final Iterable<Type> types = const <Type>[PostResponseDtoStatusEnum];
  @override
  final String wireName = 'PostResponseDtoStatusEnum';

  @override
  Object serialize(Serializers serializers, PostResponseDtoStatusEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  PostResponseDtoStatusEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      PostResponseDtoStatusEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$PostResponseDto extends PostResponseDto {
  @override
  final String id;
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
  @override
  final PostResponseDtoStatusEnum status;
  @override
  final String? customerId;
  @override
  final PostResponseDtoCustomer customer;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;

  factory _$PostResponseDto([void Function(PostResponseDtoBuilder)? updates]) =>
      (PostResponseDtoBuilder()..update(updates))._build();

  _$PostResponseDto._(
      {required this.id,
      required this.title,
      required this.description,
      this.imageUrls,
      this.location,
      this.desiredTime,
      this.budget,
      required this.status,
      this.customerId,
      required this.customer,
      required this.createdAt,
      required this.updatedAt})
      : super._();
  @override
  PostResponseDto rebuild(void Function(PostResponseDtoBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  PostResponseDtoBuilder toBuilder() => PostResponseDtoBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PostResponseDto &&
        id == other.id &&
        title == other.title &&
        description == other.description &&
        imageUrls == other.imageUrls &&
        location == other.location &&
        desiredTime == other.desiredTime &&
        budget == other.budget &&
        status == other.status &&
        customerId == other.customerId &&
        customer == other.customer &&
        createdAt == other.createdAt &&
        updatedAt == other.updatedAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, title.hashCode);
    _$hash = $jc(_$hash, description.hashCode);
    _$hash = $jc(_$hash, imageUrls.hashCode);
    _$hash = $jc(_$hash, location.hashCode);
    _$hash = $jc(_$hash, desiredTime.hashCode);
    _$hash = $jc(_$hash, budget.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, customerId.hashCode);
    _$hash = $jc(_$hash, customer.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jc(_$hash, updatedAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PostResponseDto')
          ..add('id', id)
          ..add('title', title)
          ..add('description', description)
          ..add('imageUrls', imageUrls)
          ..add('location', location)
          ..add('desiredTime', desiredTime)
          ..add('budget', budget)
          ..add('status', status)
          ..add('customerId', customerId)
          ..add('customer', customer)
          ..add('createdAt', createdAt)
          ..add('updatedAt', updatedAt))
        .toString();
  }
}

class PostResponseDtoBuilder
    implements Builder<PostResponseDto, PostResponseDtoBuilder> {
  _$PostResponseDto? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

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

  PostResponseDtoStatusEnum? _status;
  PostResponseDtoStatusEnum? get status => _$this._status;
  set status(PostResponseDtoStatusEnum? status) => _$this._status = status;

  String? _customerId;
  String? get customerId => _$this._customerId;
  set customerId(String? customerId) => _$this._customerId = customerId;

  PostResponseDtoCustomerBuilder? _customer;
  PostResponseDtoCustomerBuilder get customer =>
      _$this._customer ??= PostResponseDtoCustomerBuilder();
  set customer(PostResponseDtoCustomerBuilder? customer) =>
      _$this._customer = customer;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  DateTime? _updatedAt;
  DateTime? get updatedAt => _$this._updatedAt;
  set updatedAt(DateTime? updatedAt) => _$this._updatedAt = updatedAt;

  PostResponseDtoBuilder() {
    PostResponseDto._defaults(this);
  }

  PostResponseDtoBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _title = $v.title;
      _description = $v.description;
      _imageUrls = $v.imageUrls?.toBuilder();
      _location = $v.location;
      _desiredTime = $v.desiredTime;
      _budget = $v.budget;
      _status = $v.status;
      _customerId = $v.customerId;
      _customer = $v.customer.toBuilder();
      _createdAt = $v.createdAt;
      _updatedAt = $v.updatedAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PostResponseDto other) {
    _$v = other as _$PostResponseDto;
  }

  @override
  void update(void Function(PostResponseDtoBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PostResponseDto build() => _build();

  _$PostResponseDto _build() {
    _$PostResponseDto _$result;
    try {
      _$result = _$v ??
          _$PostResponseDto._(
            id: BuiltValueNullFieldError.checkNotNull(
                id, r'PostResponseDto', 'id'),
            title: BuiltValueNullFieldError.checkNotNull(
                title, r'PostResponseDto', 'title'),
            description: BuiltValueNullFieldError.checkNotNull(
                description, r'PostResponseDto', 'description'),
            imageUrls: _imageUrls?.build(),
            location: location,
            desiredTime: desiredTime,
            budget: budget,
            status: BuiltValueNullFieldError.checkNotNull(
                status, r'PostResponseDto', 'status'),
            customerId: customerId,
            customer: customer.build(),
            createdAt: BuiltValueNullFieldError.checkNotNull(
                createdAt, r'PostResponseDto', 'createdAt'),
            updatedAt: BuiltValueNullFieldError.checkNotNull(
                updatedAt, r'PostResponseDto', 'updatedAt'),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'imageUrls';
        _imageUrls?.build();

        _$failedField = 'customer';
        customer.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'PostResponseDto', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
