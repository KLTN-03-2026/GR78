import 'package:dio/dio.dart';
import 'package:mobile_app_doan/core/api_error_message.dart';
import 'package:openapi/openapi.dart';

class ProfileRepository {
  final ProfileApi _usersApi;

  ProfileRepository(Openapi openapi) : _usersApi = openapi.getProfileApi();

  /// Lấy profile theo token hiện tại
  Future<ProfileResponseDto> getMyProfile() async {
    try {
      final response = await _usersApi.profileControllerGetMyProfile();
      return response.data!;
    } on DioException catch (e) {
      throw Exception(describeApiError(e, fallback: 'Profile request failed'));
    }
  }

  Future<ProfileResponseDto> updateProfile(UpdateContactDto profile) async {
    try {
      final response = await _usersApi.profileControllerUpdateContact(
        updateContactDto: profile,
      );
      return response.data!;
    } on DioException catch (e) {
      throw Exception(describeApiError(e, fallback: 'Profile request failed'));
    }
  }

  Future<ProfileResponseDto> updateMyProfile(UpdateProfileDto profile) async {
    try {
      final response = await _usersApi.profileControllerUpdateMyProfile(
        updateProfileDto: profile,
      );
      return response.data!;
    } on DioException catch (e) {
      throw Exception(describeApiError(e, fallback: 'Profile request failed'));
    }
  }

  Future<ProfileResponseDto> updateAvatar(UpdateAvatarDto dto) async {
    try {
      final response =
          await _usersApi.profileControllerUpdateAvatar(updateAvatarDto: dto);
      return response.data!;
    } on DioException catch (e) {
      throw Exception(describeApiError(e, fallback: 'Profile request failed'));
    }
  }

  Future<DisplayNameChangeResponseDto> changeDisplayName(
    ChangeDisplayNameDto dto,
  ) async {
    try {
      final response = await _usersApi.profileControllerChangeDisplayName(
        changeDisplayNameDto: dto,
      );
      return response.data!;
    } on DioException catch (e) {
      throw Exception(describeApiError(e, fallback: 'Profile request failed'));
    }
  }

  Future<DeleteAccountResponseDto> deleteAccount() async {
    try {
      final response = await _usersApi.profileControllerDeleteAccount();
      return response.data!;
    } on DioException catch (e) {
      throw Exception(describeApiError(e, fallback: 'Profile request failed'));
    }
  }

  Future<PublicProfileResponseDto> getPublicProfile(String userId) async {
    try {
      final response =
          await _usersApi.profileControllerGetPublicProfile(id: userId);
      return response.data!;
    } on DioException catch (e) {
      throw Exception(describeApiError(e, fallback: 'Profile request failed'));
    }
  }

  Future<ProfileListResponseDto> searchProfiles({
    String? searchTerm,
    num limit = 20,
    num offset = 0,
  }) async {
    try {
      final response = await _usersApi.profileControllerSearchProfiles(
        searchTerm: searchTerm,
        limit: limit,
        offset: offset,
      );
      return response.data!;
    } on DioException catch (e) {
      throw Exception(describeApiError(e, fallback: 'Profile request failed'));
    }
  }
}
