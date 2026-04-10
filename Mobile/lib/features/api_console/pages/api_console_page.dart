import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:mobile_app_doan/main.dart';

class ApiConsolePage extends StatefulWidget {
  const ApiConsolePage({super.key});

  @override
  State<ApiConsolePage> createState() => _ApiConsolePageState();
}

class _ApiConsolePageState extends State<ApiConsolePage> {
  final _method = ValueNotifier<String>('GET');
  final _pathCtrl = TextEditingController(text: '/posts');
  final _queryCtrl = TextEditingController(text: '{ "limit": 10 }');
  final _headersCtrl = TextEditingController(text: '{}');
  final _bodyCtrl = TextEditingController(text: '{}');

  bool _sending = false;
  String _result = '';

  @override
  void dispose() {
    _method.dispose();
    _pathCtrl.dispose();
    _queryCtrl.dispose();
    _headersCtrl.dispose();
    _bodyCtrl.dispose();
    super.dispose();
  }

  Map<String, dynamic> _parseJsonObject(String input) {
    final trimmed = input.trim();
    if (trimmed.isEmpty) return <String, dynamic>{};
    final decoded = jsonDecode(trimmed);
    if (decoded is Map<String, dynamic>) return decoded;
    throw const FormatException('JSON must be an object (e.g. { "a": 1 })');
  }

  Future<void> _send() async {
    if (globalApi == null) {
      setState(() => _result = 'globalApi is null. App chưa init OpenAPI?');
      return;
    }

    setState(() {
      _sending = true;
      _result = '';
    });

    try {
      final path = _pathCtrl.text.trim();
      if (!path.startsWith('/')) {
        throw const FormatException('Path phải bắt đầu bằng "/". Ví dụ: /posts');
      }

      final query = _parseJsonObject(_queryCtrl.text);
      final headers = _parseJsonObject(_headersCtrl.text);

      dynamic body;
      final method = _method.value;
      if (method != 'GET' && method != 'DELETE') {
        final parsedBody = _bodyCtrl.text.trim().isEmpty
            ? <String, dynamic>{}
            : jsonDecode(_bodyCtrl.text.trim());
        body = parsedBody;
      }

      final res = await globalApi!.dio.request<Object?>(
        path,
        data: body,
        queryParameters: query,
        options: Options(method: method, headers: headers),
      );

      final prettyData = const JsonEncoder.withIndent('  ')
          .convert(res.data ?? <String, dynamic>{});

      setState(() {
        _result = [
          '✅ ${res.requestOptions.method} ${res.requestOptions.path}',
          'Status: ${res.statusCode} ${res.statusMessage ?? ''}'.trim(),
          '',
          prettyData,
        ].join('\n');
      });
    } on DioException catch (e) {
      final status = e.response?.statusCode;
      final data = e.response?.data;
      String bodyText;
      try {
        bodyText = const JsonEncoder.withIndent('  ')
            .convert(data ?? <String, dynamic>{});
      } catch (_) {
        bodyText = (data ?? '').toString();
      }

      setState(() {
        _result = [
          '❌ DioException (${status ?? 'no status'})',
          e.message ?? '',
          '',
          bodyText,
        ].where((s) => s.trim().isNotEmpty).join('\n');
      });
    } catch (e) {
      setState(() => _result = '❌ $e');
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  void _fillExample(String method, String path,
      {Map<String, dynamic>? query,
      Map<String, dynamic>? headers,
      Object? body}) {
    _method.value = method;
    _pathCtrl.text = path;
    _queryCtrl.text = const JsonEncoder.withIndent('  ').convert(query ?? {});
    _headersCtrl.text =
        const JsonEncoder.withIndent('  ').convert(headers ?? {});
    _bodyCtrl.text = const JsonEncoder.withIndent('  ').convert(body ?? {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('API Console (OpenAPI)'),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                OutlinedButton(
                  onPressed: () => _fillExample(
                    'GET',
                    '/posts/feed',
                    query: {'limit': 10},
                  ),
                  child: const Text('Posts Feed'),
                ),
                OutlinedButton(
                  onPressed: () => _fillExample('GET', '/profile/me'),
                  child: const Text('My Profile'),
                ),
                OutlinedButton(
                  onPressed: () => _fillExample(
                    'GET',
                    '/notifications',
                    query: {'page': 1, 'limit': 20, 'unreadOnly': false},
                  ),
                  child: const Text('Notifications'),
                ),
                OutlinedButton(
                  onPressed: () => _fillExample(
                    'POST',
                    '/auth/register',
                    body: {
                      'name': 'Test User',
                      'phone': '0900000000',
                      'email': 'test@example.com',
                      'password': 'P@ssw0rd!',
                      'userType': 'customer',
                    },
                  ),
                  child: const Text('Register (example)'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            ValueListenableBuilder<String>(
              valueListenable: _method,
              builder: (_, value, __) => DropdownButtonFormField<String>(
                initialValue: value,
                items: const [
                  DropdownMenuItem(value: 'GET', child: Text('GET')),
                  DropdownMenuItem(value: 'POST', child: Text('POST')),
                  DropdownMenuItem(value: 'PUT', child: Text('PUT')),
                  DropdownMenuItem(value: 'PATCH', child: Text('PATCH')),
                  DropdownMenuItem(value: 'DELETE', child: Text('DELETE')),
                ],
                onChanged: (v) {
                  if (v != null) _method.value = v;
                },
                decoration: const InputDecoration(
                  labelText: 'Method',
                  border: OutlineInputBorder(),
                ),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _pathCtrl,
              decoration: const InputDecoration(
                labelText: 'Path (ví dụ: /posts)',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _queryCtrl,
              minLines: 2,
              maxLines: 6,
              decoration: const InputDecoration(
                labelText: 'Query JSON (object)',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _headersCtrl,
              minLines: 2,
              maxLines: 6,
              decoration: const InputDecoration(
                labelText: 'Extra Headers JSON (object)',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _bodyCtrl,
              minLines: 4,
              maxLines: 10,
              decoration: const InputDecoration(
                labelText: 'Body JSON (object/array)',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            FilledButton.icon(
              onPressed: _sending ? null : _send,
              icon: _sending
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.send),
              label: Text(_sending ? 'Đang gửi...' : 'Gửi request'),
            ),
            const SizedBox(height: 16),
            const Text(
              'Kết quả',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.black,
                borderRadius: BorderRadius.circular(12),
              ),
              child: SelectableText(
                _result.isEmpty ? '(chưa có)' : _result,
                style: const TextStyle(
                  fontFamily: 'monospace',
                  color: Colors.white,
                  fontSize: 12,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

