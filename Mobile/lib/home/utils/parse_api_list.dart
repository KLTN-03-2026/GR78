/// Chuẩn hóa JSON list từ API khi OpenAPI client trả [void] / dynamic.
List<Map<String, dynamic>> parseObjectList(dynamic data) {
  if (data == null) return [];
  if (data is List) {
    return data
        .whereType<Map>()
        .map((e) => Map<String, dynamic>.from(e))
        .toList();
  }
  if (data is Map) {
    for (final key in ['data', 'items', 'quotes', 'results', 'rows']) {
      final v = data[key];
      if (v is List) {
        return v
            .whereType<Map>()
            .map((e) => Map<String, dynamic>.from(e))
            .toList();
      }
    }
  }
  return [];
}

String stringField(Map<String, dynamic> m, List<String> keys) {
  for (final k in keys) {
    final v = m[k];
    if (v != null && v.toString().isNotEmpty) return v.toString();
  }
  return '';
}
