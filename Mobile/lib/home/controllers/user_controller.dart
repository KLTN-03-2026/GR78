import 'package:get/get.dart';
import 'package:mobile_app_doan/home/repo/user_repository.dart';
import 'package:openapi/openapi.dart';

class ProfileController extends GetxController {
  final ProfileRepository repository;

  ProfileController(this.repository);

  // STATE
  final isLoading = false.obs;
  final profile = Rx<ProfileResponseDto?>(null);
  final errorMessage = ''.obs;

  final searchLoading = false.obs;
  final searchResults = Rx<ProfileListResponseDto?>(null);

  /// Gọi API lấy profile
  Future<void> loadProfile() async {
    try {
      isLoading.value = true;
      errorMessage.value = '';

      final data = await repository.getMyProfile();
      profile.value = data;
    } catch (e) {
      errorMessage.value = e.toString();
    } finally {
      isLoading.value = false;
    }
  }

  //update contact (email, phone)
  Future<bool> updateProfile(UpdateContactDto contact) async {
    try {
      isLoading.value = true;
      errorMessage.value = '';
      final data = await repository.updateProfile(contact);
      profile.value = data;
      return true;
    } catch (e) {
      errorMessage.value = e.toString();
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  //update profile (fullName, address, bio, birthday, gender — không gồm avatar/displayName)
  Future<bool> updateMyProfile(UpdateProfileDto profileDto) async {
    try {
      isLoading.value = true;
      errorMessage.value = '';
      final data = await repository.updateMyProfile(profileDto);
      profile.value = data;
      return true;
    } catch (e) {
      errorMessage.value = e.toString();
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  Future<bool> updateAvatar(UpdateAvatarDto dto) async {
    try {
      isLoading.value = true;
      errorMessage.value = '';
      final data = await repository.updateAvatar(dto);
      profile.value = data;
      return true;
    } catch (e) {
      errorMessage.value = e.toString();
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  Future<DisplayNameChangeResponseDto?> changeDisplayName(
    ChangeDisplayNameDto dto,
  ) async {
    try {
      isLoading.value = true;
      errorMessage.value = '';
      final res = await repository.changeDisplayName(dto);
      await loadProfile();
      return res;
    } catch (e) {
      errorMessage.value = e.toString();
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  Future<DeleteAccountResponseDto?> deleteAccount() async {
    try {
      isLoading.value = true;
      errorMessage.value = '';
      return await repository.deleteAccount();
    } catch (e) {
      errorMessage.value = e.toString();
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  Future<PublicProfileResponseDto?> getPublicProfile(String userId) async {
    try {
      errorMessage.value = '';
      return await repository.getPublicProfile(userId);
    } catch (e) {
      errorMessage.value = e.toString();
      return null;
    }
  }

  Future<void> searchProfiles(String term, {num limit = 20, num offset = 0}) async {
    try {
      searchLoading.value = true;
      errorMessage.value = '';
      final res = await repository.searchProfiles(
        searchTerm: term.isEmpty ? null : term,
        limit: limit,
        offset: offset,
      );
      searchResults.value = res;
    } catch (e) {
      errorMessage.value = e.toString();
      searchResults.value = null;
    } finally {
      searchLoading.value = false;
    }
  }
}
