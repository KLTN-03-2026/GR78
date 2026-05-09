// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'post_response_dto_customer.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PostResponseDtoCustomer extends PostResponseDtoCustomer {
  @override
  final String? id;
  @override
  final String? fullName;
  @override
  final String? avatarUrl;

  factory _$PostResponseDtoCustomer(
          [void Function(PostResponseDtoCustomerBuilder)? updates]) =>
      (PostResponseDtoCustomerBuilder()..update(updates))._build();

  _$PostResponseDtoCustomer._({this.id, this.fullName, this.avatarUrl})
      : super._();
  @override
  PostResponseDtoCustomer rebuild(
          void Function(PostResponseDtoCustomerBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  PostResponseDtoCustomerBuilder toBuilder() =>
      PostResponseDtoCustomerBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PostResponseDtoCustomer &&
        id == other.id &&
        fullName == other.fullName &&
        avatarUrl == other.avatarUrl;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, fullName.hashCode);
    _$hash = $jc(_$hash, avatarUrl.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PostResponseDtoCustomer')
          ..add('id', id)
          ..add('fullName', fullName)
          ..add('avatarUrl', avatarUrl))
        .toString();
  }
}

class PostResponseDtoCustomerBuilder
    implements
        Builder<PostResponseDtoCustomer, PostResponseDtoCustomerBuilder> {
  _$PostResponseDtoCustomer? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _fullName;
  String? get fullName => _$this._fullName;
  set fullName(String? fullName) => _$this._fullName = fullName;

  String? _avatarUrl;
  String? get avatarUrl => _$this._avatarUrl;
  set avatarUrl(String? avatarUrl) => _$this._avatarUrl = avatarUrl;

  PostResponseDtoCustomerBuilder() {
    PostResponseDtoCustomer._defaults(this);
  }

  PostResponseDtoCustomerBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _fullName = $v.fullName;
      _avatarUrl = $v.avatarUrl;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PostResponseDtoCustomer other) {
    _$v = other as _$PostResponseDtoCustomer;
  }

  @override
  void update(void Function(PostResponseDtoCustomerBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PostResponseDtoCustomer build() => _build();

  _$PostResponseDtoCustomer _build() {
    final _$result = _$v ??
        _$PostResponseDtoCustomer._(
          id: id,
          fullName: fullName,
          avatarUrl: avatarUrl,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
