// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'profile_list_response_dto.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ProfileListResponseDto extends ProfileListResponseDto {
  @override
  final BuiltList<PublicProfileResponseDto> profiles;
  @override
  final num total;
  @override
  final num count;

  factory _$ProfileListResponseDto(
          [void Function(ProfileListResponseDtoBuilder)? updates]) =>
      (ProfileListResponseDtoBuilder()..update(updates))._build();

  _$ProfileListResponseDto._(
      {required this.profiles, required this.total, required this.count})
      : super._();
  @override
  ProfileListResponseDto rebuild(
          void Function(ProfileListResponseDtoBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ProfileListResponseDtoBuilder toBuilder() =>
      ProfileListResponseDtoBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ProfileListResponseDto &&
        profiles == other.profiles &&
        total == other.total &&
        count == other.count;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, profiles.hashCode);
    _$hash = $jc(_$hash, total.hashCode);
    _$hash = $jc(_$hash, count.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ProfileListResponseDto')
          ..add('profiles', profiles)
          ..add('total', total)
          ..add('count', count))
        .toString();
  }
}

class ProfileListResponseDtoBuilder
    implements Builder<ProfileListResponseDto, ProfileListResponseDtoBuilder> {
  _$ProfileListResponseDto? _$v;

  ListBuilder<PublicProfileResponseDto>? _profiles;
  ListBuilder<PublicProfileResponseDto> get profiles =>
      _$this._profiles ??= ListBuilder<PublicProfileResponseDto>();
  set profiles(ListBuilder<PublicProfileResponseDto>? profiles) =>
      _$this._profiles = profiles;

  num? _total;
  num? get total => _$this._total;
  set total(num? total) => _$this._total = total;

  num? _count;
  num? get count => _$this._count;
  set count(num? count) => _$this._count = count;

  ProfileListResponseDtoBuilder() {
    ProfileListResponseDto._defaults(this);
  }

  ProfileListResponseDtoBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _profiles = $v.profiles.toBuilder();
      _total = $v.total;
      _count = $v.count;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ProfileListResponseDto other) {
    _$v = other as _$ProfileListResponseDto;
  }

  @override
  void update(void Function(ProfileListResponseDtoBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ProfileListResponseDto build() => _build();

  _$ProfileListResponseDto _build() {
    _$ProfileListResponseDto _$result;
    try {
      _$result = _$v ??
          _$ProfileListResponseDto._(
            profiles: profiles.build(),
            total: BuiltValueNullFieldError.checkNotNull(
                total, r'ProfileListResponseDto', 'total'),
            count: BuiltValueNullFieldError.checkNotNull(
                count, r'ProfileListResponseDto', 'count'),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'profiles';
        profiles.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'ProfileListResponseDto', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
