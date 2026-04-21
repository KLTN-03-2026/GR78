import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile_app_doan/core/api.dart';
import 'package:mobile_app_doan/features/auth/controllers/auth_controller.dart';
import 'package:mobile_app_doan/features/auth/controllers/pages/auth_mobile.dart';
import 'package:mobile_app_doan/features/auth/controllers/pages/login_page.dart';
import 'package:mobile_app_doan/features/auth/controllers/pages/register_page.dart';
import 'package:mobile_app_doan/features/auth/repo/auth_repository.dart';
import 'package:mobile_app_doan/features/auth/services/auth_service.dart';
import 'package:mobile_app_doan/features/api_console/pages/api_console_page.dart';
import 'package:mobile_app_doan/features/auth/controllers/pages/forgot_password_page.dart';
import 'package:mobile_app_doan/features/auth/controllers/pages/reset_password_page.dart';
import 'package:mobile_app_doan/home/controllers/chat_controller.dart';
import 'package:mobile_app_doan/home/controllers/notification_controller.dart';
import 'package:mobile_app_doan/home/controllers/order_controller.dart';
import 'package:mobile_app_doan/home/controllers/post_controller.dart';
import 'package:mobile_app_doan/home/controllers/quote_controller.dart';
import 'package:mobile_app_doan/home/controllers/user_controller.dart';
import 'package:mobile_app_doan/home/pages/home.dart';
import 'package:mobile_app_doan/home/pages/my_quotes_page.dart';
import 'package:mobile_app_doan/home/pages/orders_page.dart';
import 'package:mobile_app_doan/home/pages/saved_posts_page.dart';
import 'package:mobile_app_doan/home/repo/backend_rest_repository.dart';
import 'package:mobile_app_doan/home/repo/notification_repository.dart';
import 'package:mobile_app_doan/home/repo/post_repository.dart';
import 'package:mobile_app_doan/home/repo/quote_repository.dart';
import 'package:mobile_app_doan/home/repo/user_repository.dart';
import 'package:openapi/openapi.dart';
import 'package:dio/dio.dart';

// Global OpenAPI instance
Openapi? globalApi;

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // 🔹 Tạo Dio riêng và thêm interceptor
  final dioInstance = Dio(
    BaseOptions(
      baseUrl: 'https://postmaxillary-variably-justa.ngrok-free.dev/api/v1',
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      sendTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    ),
  );

  setupInterceptorsForDio(dioInstance); // setup interceptor + refresh token

  // 🔹 Truyền Dio này vào OpenAPI
  final api = Openapi(dio: dioInstance);
  globalApi = api;

  // Inject AuthController
  final authRepo = AuthRepository(
    api.getAuthMobileApi(),
    api.getAuthCommonApi(),
    api.getAuthWebApi(),
    dioInstance,
  );
  final profileRepo = ProfileRepository(api);
  final authService = AuthService();
  final authController = AuthController(
    repository: authRepo,
    authService: authService,
    profileRepository: profileRepo,
  );
  Get.put<AuthController>(authController, permanent: true);

  // Callback logout khi refresh token thất bại
  setOnUnauthorizedCallback(() {
    print('🚨 Unauthorized! Logging out user...');
    final controller = Get.find<AuthController>();
    controller.logout();
    Get.offAllNamed('/login');
  });

  // Init AuthService và set bearer token cho OpenAPI
  await authService.init();
  final token = await authService.getAccessToken();
  if (token != null && token.isNotEmpty) {
    api.setBearerAuth('bearer', token);
    print('✅ Bearer token set in OpenAPI');
  }

  // Restore user session
  await authController.loadUserInfo();

  // Inject các controller
  Get.put<PostController>(PostController(PostRepository(api)));
  Get.put<QuoteController>(QuoteController(QuoteRepository(api)));
  Get.put<ProfileController>(ProfileController(profileRepo));
  Get.put<NotificationController>(
    NotificationController(NotificationRepository(api)),
  );
  if (authController.isLoggedIn.value) {
    await Get.find<NotificationController>().connectNotificationSocket();
  }

  final rest = BackendRestRepository(dioInstance);
  Get.put<BackendRestRepository>(rest, permanent: true);
  Get.put<ChatController>(ChatController(rest), permanent: true);
  Get.put<OrderController>(OrderController(rest), permanent: true);

  if (authController.isLoggedIn.value) {
    await Get.find<ChatController>().connectChatSocket();
  }

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    final authController = Get.find<AuthController>();
    final initial = authController.isLoggedIn.value ? '/home' : '/login';

    return GetMaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Mobile App',
      initialRoute: initial,
      getPages: [
        GetPage(name: '/auth', page: () => const Auth_Screen()),
        GetPage(name: '/home', page: () => const MobileHomeScreen()),
        GetPage(name: '/login', page: () => const LoginPage()),
        GetPage(
          name: '/register',
          page: () => RegisterPage(
            onLogin: () => Get.offNamed('/login'),
          ),
        ),
        GetPage(name: '/api', page: () => const ApiConsolePage()),
        GetPage(name: '/my-quotes', page: () => const MyQuotesPage()),
        GetPage(name: '/orders', page: () => const OrdersPage()),
        GetPage(name: '/saved-posts', page: () => const SavedPostsPage()),
        GetPage(name: '/forgot-password', page: () => const ForgotPasswordPage()),
        GetPage(
          name: '/reset-password',
          page: () => const ResetPasswordPage(),
        ),
      ],
    );
  }
}
