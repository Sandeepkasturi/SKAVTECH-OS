import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  // Replace with dynamic URL
  String baseUrl = '';
  final _storage = const FlutterSecureStorage();

  void setBaseUrl(String url) {
    baseUrl = url;
  }

  Future<String?> login(String username, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {
          'Content-Type': 'application/json',
          'Bypass-Tunnel-Reminder': 'true', // Required for Localtunnel
        },
        body: jsonEncode({'username': username, 'password': password}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final token = data['access_token'];
        await _storage.write(key: 'jwt_token', value: token);
        return null; // No error
      } else {
        return 'Login failed: ${response.body}';
      }
    } catch (e) {
      return 'Connection error: $e';
    }
  }

  Future<Map<String, dynamic>?> getStatus() async {
    final token = await _storage.read(key: 'jwt_token');
    if (token == null) return null;

    try {
      final response = await http.get(
        Uri.parse('$baseUrl/os/status'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
          'Bypass-Tunnel-Reminder': 'true',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return null;
    } catch (e) {
      print('Error fetching status: $e');
      return null;
    }
  }

  Future<Map<String, dynamic>> executeAction(String command) async {
    final token = await _storage.read(key: 'jwt_token');
    if (token == null) return {'status': 'failed', 'error': 'No token'};

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/os/action'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
          'Bypass-Tunnel-Reminder': 'true',
        },
        body: jsonEncode({'command': command}),
      );

      return jsonDecode(response.body);
    } catch (e) {
      return {'status': 'failed', 'error': e.toString()};
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: 'jwt_token');
  }
}
