/// Chỉ dùng [NetworkImage] khi URL là http(s); tránh `file://`, đường assets, v.v.
bool isHttpImageUrl(String? url) {
  if (url == null) return false;
  final t = url.trim();
  if (t.isEmpty) return false;
  final lower = t.toLowerCase();
  return lower.startsWith('http://') || lower.startsWith('https://');
}
