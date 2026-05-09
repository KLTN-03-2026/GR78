// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'update_contact_dto.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$UpdateContactDto extends UpdateContactDto {
  @override
  final String? email;
  @override
  final String? phone;

  factory _$UpdateContactDto(
          [void Function(UpdateContactDtoBuilder)? updates]) =>
      (UpdateContactDtoBuilder()..update(updates))._build();

  _$UpdateContactDto._({this.email, this.phone}) : super._();
  @override
  UpdateContactDto rebuild(void Function(UpdateContactDtoBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  UpdateContactDtoBuilder toBuilder() =>
      UpdateContactDtoBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is UpdateContactDto &&
        email == other.email &&
        phone == other.phone;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, email.hashCode);
    _$hash = $jc(_$hash, phone.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'UpdateContactDto')
          ..add('email', email)
          ..add('phone', phone))
        .toString();
  }
}

class UpdateContactDtoBuilder
    implements Builder<UpdateContactDto, UpdateContactDtoBuilder> {
  _$UpdateContactDto? _$v;

  String? _email;
  String? get email => _$this._email;
  set email(String? email) => _$this._email = email;

  String? _phone;
  String? get phone => _$this._phone;
  set phone(String? phone) => _$this._phone = phone;

  UpdateContactDtoBuilder() {
    UpdateContactDto._defaults(this);
  }

  UpdateContactDtoBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _email = $v.email;
      _phone = $v.phone;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(UpdateContactDto other) {
    _$v = other as _$UpdateContactDto;
  }

  @override
  void update(void Function(UpdateContactDtoBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  UpdateContactDto build() => _build();

  _$UpdateContactDto _build() {
    final _$result = _$v ??
        _$UpdateContactDto._(
          email: email,
          phone: phone,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
