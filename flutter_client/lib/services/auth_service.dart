import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class SessionExpiredException implements Exception {
  final String message;

  const SessionExpiredException([
    this.message = 'Your session expired. Please log in again.',
  ]);

  @override
  String toString() => message;
}

class CurrentUser {
  final String id;
  final String username;
  final String email;
  final String themePreference;

  const CurrentUser({
    required this.id,
    required this.username,
    required this.email,
    required this.themePreference,
  });

  factory CurrentUser.fromJson(Map<String, dynamic> json) {
    return CurrentUser(
      id: (json['id'] ?? '').toString(),
      username: (json['username'] ?? '').toString(),
      email: (json['email'] ?? '').toString(),
      themePreference: (json['themePreference'] ?? 'light').toString(),
    );
  }
}

class AuthService {
  static const String baseUrl = 'https://www.cop4331linhtran.studio';
  static const String _tokenStorageKey = 'auth_token';

  static String? token;
  static CurrentUser? currentUser;

  static Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    token = prefs.getString(_tokenStorageKey);
  }

  static Future<void> _persistToken(String? value) async {
    final prefs = await SharedPreferences.getInstance();

    if (value == null || value.isEmpty) {
      await prefs.remove(_tokenStorageKey);
    } else {
      await prefs.setString(_tokenStorageKey, value);
    }

    token = value;
  }

  static bool get isLoggedIn => token != null && token!.isNotEmpty;

  static Map<String, String> _headers({bool auth = false}) {
    final headers = <String, String>{
      'Content-Type': 'application/json',
    };

    if (auth) {
      if (token == null || token!.isEmpty) {
        throw const SessionExpiredException();
      }
      headers['Authorization'] = 'Bearer $token';
    }

    return headers;
  }

  static Map<String, dynamic> _decodeObject(http.Response res) {
    try {
      return jsonDecode(res.body) as Map<String, dynamic>;
    } catch (_) {
      throw Exception(
        'Server returned non-JSON response (status ${res.statusCode}).',
      );
    }
  }

  static Future<void> _handleUnauthorizedResponse(http.Response res) async {
    if (res.statusCode == 401) {
      currentUser = null;
      await _persistToken(null);
      throw const SessionExpiredException();
    }
  }

  static Future<Map<String, dynamic>> login(String email, String password) async {
    final res = await http.post(
      Uri.parse('$baseUrl/login'),
      headers: _headers(),
      body: jsonEncode({
        'email': email.trim(),
        'password': password,
      }),
    );

    final data = _decodeObject(res);

    if (res.statusCode != 200) {
      throw Exception(
        data['error'] ?? data['message'] ?? 'Login failed',
      );
    }

    await _persistToken(data['token']?.toString());

    final rawUser = data['user'];
    if (rawUser is Map<String, dynamic>) {
      currentUser = CurrentUser.fromJson(rawUser);
    }

    return data;
  }

  static Future<CurrentUser> fetchCurrentUser() async {
    final res = await http.get(
      Uri.parse('$baseUrl/me'),
      headers: _headers(auth: true),
    );

    await _handleUnauthorizedResponse(res);
    final data = _decodeObject(res);

    if (res.statusCode != 200) {
      throw Exception(
        data['error'] ?? data['message'] ?? 'Failed to load profile',
      );
    }

    final rawUser = data['user'];
    if (rawUser is! Map<String, dynamic>) {
      throw Exception('Profile response was missing user data.');
    }

    currentUser = CurrentUser.fromJson(rawUser);
    return currentUser!;
  }

  static Future<CurrentUser> updateThemePreference(String themePreference) async {
    final res = await http.patch(
      Uri.parse('$baseUrl/me'),
      headers: _headers(auth: true),
      body: jsonEncode({
        'themePreference': themePreference,
      }),
    );

    await _handleUnauthorizedResponse(res);
    final data = _decodeObject(res);

    if (res.statusCode != 200) {
      throw Exception(
        data['error'] ?? data['message'] ?? 'Failed to update theme preference',
      );
    }

    final rawUser = data['user'];
    if (rawUser is! Map<String, dynamic>) {
      throw Exception('Profile response was missing user data.');
    }

    currentUser = CurrentUser.fromJson(rawUser);
    return currentUser!;
  }

  static Future<void> register(String username, String email, String password) async {
    final res = await http.post(
      Uri.parse('$baseUrl/register'),
      headers: _headers(),
      body: jsonEncode({
        'username': username.trim(),
        'email': email.trim(),
        'password': password,
      }),
    );

    final data = _decodeObject(res);

    if (res.statusCode != 200 && res.statusCode != 201) {
      throw Exception(
        data['error'] ?? data['message'] ?? 'Register failed',
      );
    }
  }

  static Future<String> forgotPassword(String email) async {
    final res = await http.post(
      Uri.parse('$baseUrl/forgot-password'),
      headers: _headers(),
      body: jsonEncode({
        'email': email.trim(),
      }),
    );

    final data = _decodeObject(res);

    if (res.statusCode != 200) {
      throw Exception(
        data['error'] ?? data['message'] ?? 'Failed to send reset email',
      );
    }

    return (data['message'] ?? 'If that email exists, a reset link has been sent.')
        .toString();
  }

  static Future<String> resetPassword(String tokenValue, String password) async {
    final res = await http.post(
      Uri.parse('$baseUrl/reset-password'),
      headers: _headers(),
      body: jsonEncode({
        'token': tokenValue.trim(),
        'password': password,
      }),
    );

    final data = _decodeObject(res);

    if (res.statusCode != 200) {
      throw Exception(
        data['error'] ?? data['message'] ?? 'Failed to reset password',
      );
    }

    return (data['message'] ?? 'Password reset successfully.').toString();
  }

  static Future<void> logout() async {
    currentUser = null;
    await _persistToken(null);
  }
}
