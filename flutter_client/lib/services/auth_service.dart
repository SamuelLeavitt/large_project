import 'dart:convert';
import 'package:http/http.dart' as http;

class AuthService {
  static const String baseUrl = 'https://s2a0m2u6.xyz/api/auth';

  static Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await http.post(
      Uri.parse('$baseUrl/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email.trim(),
        'password': password,
      }),
    );

    Map<String, dynamic> data = {};
    try {
      data = jsonDecode(res.body) as Map<String, dynamic>;
    } catch (_) {
      throw Exception(
        'Server returned non-JSON response (status ${res.statusCode}).',
      );
    }

    if (res.statusCode != 200) {
      throw Exception(
        data['error'] ?? data['message'] ?? 'Login failed',
      );
    }

    return data;
  }

  static Future<void> register(String username, String email, String password) async {
    final res = await http.post(
      Uri.parse('$baseUrl/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'username': username.trim(),
        'email': email.trim(),
        'password': password,
      }),
    );

    Map<String, dynamic> data = {};
    try {
      data = jsonDecode(res.body) as Map<String, dynamic>;
    } catch (_) {
      throw Exception(
        'Server returned non-JSON response (status ${res.statusCode}).',
      );
    }

    if (res.statusCode != 200 && res.statusCode != 201) {
      throw Exception(
        data['error'] ?? data['message'] ?? 'Register failed',
      );
    }
  }
}
