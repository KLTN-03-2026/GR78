/// Bỏ hậu tố `/api/v1` để lấy origin Socket.IO (cùng host với REST).
String apiSocketRootFromBase(String baseUrl) {
  var u = baseUrl.trim();
  if (u.endsWith('/')) u = u.substring(0, u.length - 1);
  const suffix = '/api/v1';
  if (u.endsWith(suffix)) {
    return u.substring(0, u.length - suffix.length);
  }
  return u;
}
