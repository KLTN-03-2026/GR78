import 'package:dio/dio.dart';
import 'package:openapi/openapi.dart';

class ProfileRepository {
  final ProfileApi _usersApi;

  ProfileRepository(Openapi openapi) : _usersApi = openapi.getProfileApi();

  String _msg(DioException e) =>
      e.response?.data?['message']?.toString() ?? 'Profile request failed';

  /// Lấy profile theo token hiện tại
  Future<ProfileResponseDto> getMyProfile() async {
    try {
      final response = await _usersApi.profileControllerGetMyProfile();
      return response.data!;
    } on DioException catch (e) {
      throw Exception(_msg(e));
    }
  }

  Future<ProfileResponseDto> updateProfile(UpdateContactDto profile) async {
    try {
      final response = await _usersApi.profileControllerUpdateContact(
        updateContactDto: profile,
      );
      return response.data!;
    } on DioException catch (e) {
      throw Exception(_msg(e));
    }
  }

  Future<ProfileResponseDto> updateMyProfile(UpdateProfileDto profile) async {
    try {
      final response = await _usersApi.profileControllerUpdateMyProfile(
        updateProfileDto: profile,
      );
      return response.data!;
    } on DioException catch (e) {
      throw Exception(_msg(e));
    }
  }

  Future<ProfileResponseDto> updateAvatar(UpdateAvatarDto dto) async {
    try {
      final response =
          await _usersApi.profileControllerUpdateAvatar(updateAvatarDto: dto);
      return response.data!;
    } on DioException catch (e) {
      throw Exception(_msg(e));
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
      throw Exception(_msg(e));
    }
  }

  Future<DeleteAccountResponseDto> deleteAccount() async {
    try {
      final response = await _usersApi.profileControllerDeleteAccount();
      return response.data!;
    } on DioException catch (e) {
      throw Exception(_msg(e));
    }
  }

  Future<PublicProfileResponseDto> getPublicProfile(String userId) async {
    try {
      final response =
          await _usersApi.profileControllerGetPublicProfile(id: userId);
      return response.data!;
    } on DioException catch (e) {
      throw Exception(_msg(e));
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
      throw Exception(_msg(e));
    }
  }
}
