/// Base URL REST (có `/api/v1`).
///
/// Có thể override khi build:
/// `--dart-define=API_BASE_V1=https://host/api/v1`
const String kApiBaseUrlV1 = String.fromEnvironment(
  'API_BASE_V1',
  defaultValue: 'https://postmaxillary-variably-justa.ngrok-free.dev/api/v1',
);
