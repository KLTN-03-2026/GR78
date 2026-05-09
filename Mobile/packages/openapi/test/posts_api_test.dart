import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for PostsApi
void main() {
  final instance = Openapi().getPostsApi();

  group(PostsApi, () {
    // Close post
    //
    // Change post status to CLOSED. Only the post owner can close it.
    //
    //Future<PostResponseDto> postControllerClosePost(String id) async
    test('test postControllerClosePost', () async {
      // TODO
    });

    // Create new post
    //
    // Create a new service request post (Customer only)
    //
    //Future<PostResponseDto> postControllerCreatePost(CreatePostDto createPostDto) async
    test('test postControllerCreatePost', () async {
      // TODO
    });

    // Delete post
    //
    // Soft delete a post. Only the post owner can delete it.
    //
    //Future<DeletePostResponseDto> postControllerDeletePost(String id) async
    test('test postControllerDeletePost', () async {
      // TODO
    });

    // Get public feed of open posts
    //
    // Retrieve paginated list of all open posts from customers. Uses cursor-based pagination for infinite scroll.
    //
    //Future<FeedResponseDto> postControllerGetFeed({ num limit, String cursor }) async
    test('test postControllerGetFeed', () async {
      // TODO
    });

    // Get my posts
    //
    // Retrieve all posts created by the current customer
    //
    //Future<FeedResponseDto> postControllerGetMyPosts({ num limit, String cursor }) async
    test('test postControllerGetMyPosts', () async {
      // TODO
    });

    // Get post by ID
    //
    // Retrieve detailed information of a specific post
    //
    //Future<PostResponseDto> postControllerGetPostById(String id) async
    test('test postControllerGetPostById', () async {
      // TODO
    });

    // Update post
    //
    // Update an existing post. Only the post owner can update it.
    //
    //Future<PostResponseDto> postControllerUpdatePost(String id, UpdatePostDto updatePostDto) async
    test('test postControllerUpdatePost', () async {
      // TODO
    });

  });
}
