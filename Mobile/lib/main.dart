import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:mobile_app_doan/core/api.dart';
import 'package:mobile_app_doan/core/api_config.dart';
import 'package:mobile_app_doan/core/app_route_observer.dart';
import 'package:mobile_app_doan/core/deferred_login_navigation.dart';
import 'package:mobile_app_doan/core/theme/app_motion.dart';
import 'package:mobile_app_doan/core/theme/app_theme.dart';
import 'package:mobile_app_doan/features/auth/controllers/auth_controller.dart';
import 'package:mobile_app_doan/features/auth/controllers/pages/auth_mobile.dart';
import 'package:mobile_app_doan/features/auth/controllers/pages/login_page.dart';
import 'package:mobile_app_doan/features/auth/controllers/pages/register_page.dart';
import 'package:mobile_app_doan/features/auth/repo/auth_repository.dart';
import 'package:mobile_app_doan/features/auth/services/auth_service.dart';
import 'package:mobile_app_doan/features/api_console/pages/api_console_page.dart';
import 'package:mobile_app_doan/features/auth/controllers/pages/forgot_password_page.dart';
import 'package:mobile_app_doan/features/auth/controllers/pages/reset_password_page.dart';
import 'package:mobile_app_doan/features/auth/controllers/pages/reset_password_otp_page.dart';
import 'package:mobile_app_doan/features/auth/controllers/pages/verify_email_page.dart';
import 'package:mobile_app_doan/features/misc/presentation/coming_soon_page.dart';
import 'package:mobile_app_doan/features/settings/presentation/settings_page.dart';
import 'package:mobile_app_doan/home/controllers/chat_controller.dart';
import 'package:mobile_app_doan/home/controllers/mobile_shell_controller.dart';
import 'package:mobile_app_doan/home/controllers/certification_controller.dart';
import 'package:mobile_app_doan/home/controllers/custom_request_controller.dart';
import 'package:mobile_app_doan/home/controllers/notification_controller.dart';
import 'package:mobile_app_doan/home/controllers/order_controller.dart';
import 'package:mobile_app_doan/home/controllers/post_controller.dart';
import 'package:mobile_app_doan/home/controllers/quote_controller.dart';
import 'package:mobile_app_doan/home/controllers/review_controller.dart';
import 'package:mobile_app_doan/home/controllers/subscription_controller.dart';
import 'package:mobile_app_doan/home/controllers/user_controller.dart';
import 'package:mobile_app_doan/home/pages/awaiting_confirmation_page.dart';
import 'package:mobile_app_doan/home/pages/certifications_page.dart';
import 'package:mobile_app_doan/home/pages/custom_requests_page.dart';
import 'package:mobile_app_doan/home/pages/home.dart';
import 'package:mobile_app_doan/home/pages/my_quotes_page.dart';
import 'package:mobile_app_doan/home/pages/orders_page.dart';
import 'package:mobile_app_doan/home/pages/public_profile_page.dart';
import 'package:mobile_app_doan/home/pages/reviews_page.dart';
import 'package:mobile_app_doan/home/pages/saved_posts_page.dart';
import 'package:mobile_app_doan/home/pages/subscription_page.dart';
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
      baseUrl: kApiBaseUrlV1,
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

  // Callback logout khi refresh token thất bại (có thể chạy trước runApp — không gọi Get.offAllNamed trực tiếp)
  setOnUnauthorizedCallback(() {
    print('🚨 Unauthorized! Logging out user...');
    final controller = Get.find<AuthController>();
    controller.logout();
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
  if (authController.isLoggedIn.value) {
    final profileCtl = Get.find<ProfileController>();
    await profileCtl.loadProfile();
    final prof = profileCtl.profile.value;
    if (prof != null) {
      await authController.applyProfileToSessionCaches(prof);
    }
  }
  Get.put<NotificationController>(
    NotificationController(NotificationRepository(api)),
  );
  if (authController.isLoggedIn.value) {
    await Get.find<NotificationController>().connectNotificationSocket();
  }

  final rest = BackendRestRepository(dioInstance);
  Get.put<BackendRestRepository>(rest, permanent: true);
  Get.put<MobileShellController>(MobileShellController(), permanent: true);
  Get.put<ChatController>(ChatController(rest), permanent: true);
  Get.put<OrderController>(OrderController(rest), permanent: true);
  Get.put<ReviewController>(ReviewController(rest), permanent: true);
  Get.put<CertificationController>(CertificationController(rest), permanent: true);
  Get.put<SubscriptionController>(SubscriptionController(rest), permanent: true);
  Get.put<CustomRequestController>(CustomRequestController(rest), permanent: true);

  if (authController.isLoggedIn.value) {
    await Get.find<ChatController>().connectChatSocket();
  }

  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      flushPendingOffAllToLogin();
      WidgetsBinding.instance.addPostFrameCallback((_) {
        flushPendingOffAllToLogin();
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final authController = Get.find<AuthController>();
    final initial = authController.isLoggedIn.value ? '/home' : '/login';

    return GetMaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Mobile App',
      navigatorObservers: [appRouteObserver],
      theme: AppTheme.light(),
      scrollBehavior: const MaterialScrollBehavior().copyWith(
        physics: const BouncingScrollPhysics(
          parent: AlwaysScrollableScrollPhysics(),
        ),
      ),
      defaultTransition: Transition.cupertino,
      transitionDuration: AppMotion.routeTransition,
      initialRoute: initial,
      getPages: [
        GetPage(name: '/auth', page: () => const Auth_Screen()),
        GetPage(name: '/home', page: () => const MobileHomeScreen()),
        GetPage(
          name: '/user/:userId',
          page: () => PublicProfilePage(
            userId: Get.parameters['userId'] ?? '',
          ),
        ),
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
        GetPage(name: '/verify-email', page: () => const VerifyEmailPage()),
        GetPage(
          name: '/reset-password',
          page: () => const ResetPasswordPage(),
        ),
        GetPage(
          name: '/reset-password-otp',
          page: () => const ResetPasswordOtpPage(),
        ),
        GetPage(name: '/settings', page: () => const SettingsPage()),
        GetPage(name: '/my-reviews', page: () => const MyReviewsPage()),
        GetPage(
          name: '/provider-reviews/:providerId',
          page: () => ProviderReviewsPage(
            providerId: Get.parameters['providerId'] ?? '',
          ),
        ),
        GetPage(name: '/certifications', page: () => const CertificationsPage()),
        GetPage(name: '/subscription', page: () => const SubscriptionPage()),
        GetPage(name: '/custom-requests', page: () => const CustomRequestsPage()),
        GetPage(name: '/awaiting-confirmation', page: () => const AwaitingConfirmationPage()),
        GetPage(
          name: '/favorite-workers',
          page: () => const ComingSoonPage(
            title: 'Thợ yêu thích',
            subtitle:
                'Backend hiện chưa có API lưu danh sách thợ yêu thích. Tính năng sẽ bật khi có endpoint.',
          ),
        ),
      ],
    );
  }
}
