import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  // Singleton pattern
  static final ApiService _instance = ApiService._internal();

  factory ApiService() {
    return _instance;
  }

  ApiService._internal();

  // Replace with dynamic URL
  String baseUrl = '';
  final _storage = const FlutterSecureStorage();

  void setBaseUrl(String url) {
    if (url.endsWith('/')) {
        baseUrl = url.substring(0, url.length - 1);
    } else {
        baseUrl = url;
    }
  }

  Future<String?> fetchConnectionUrl() async {
    try {
      // Fetch the raw file from the repository
      final response = await http.get(
        Uri.parse('https://raw.githubusercontent.com/Sandeepkasturi/SKAVTECH-OS/main/connection.txt'),
        headers: {'Cache-Control': 'no-cache'}, // Prevent caching old URLs
      );

      if (response.statusCode == 200) {
        final url = response.body.trim();
        if (url.startsWith('http')) {
          setBaseUrl(url); // Use setter to sanitize
          return url;
        }
      }
      return null;
    } catch (e) {
      print('Auto-discovery failed: $e');
      return null;
    }
  }

  Future<String?> login(String username, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
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
    if (baseUrl.isEmpty) return null;
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/os/status'),
        headers: {
          'Content-Type': 'application/json',
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
    if (baseUrl.isEmpty) return {'status': 'failed', 'error': 'No connection URL'};
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/os/action'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({'command': command}),
      );

      return jsonDecode(response.body);
    } catch (e) {
      return {'status': 'failed', 'error': e.toString()};
    }
  }

  Future<Map<String, dynamic>> fetchCommands() async {
    if (baseUrl.isEmpty) return {};
    try {
      final response = await http.get(Uri.parse('$baseUrl/os/commands'));
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
      return {};
    } catch (e) {
      print("Error fetching commands: $e");
      return {};
    }
  }

  Future<bool> addCommand(String name, String command) async {
    if (baseUrl.isEmpty) return false;
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/os/commands'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'name': name, 'command': command}),
      );
      return response.statusCode == 200;
    } catch (e) {
      print("Error adding command: $e");
      return false;
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: 'jwt_token');
  }
}
