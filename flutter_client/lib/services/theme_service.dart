import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ThemeService {
  static const String _themeStorageKey = 'theme_preference';

  static final ValueNotifier<ThemeMode> themeMode =
      ValueNotifier<ThemeMode>(ThemeMode.light);

  static Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    final stored = prefs.getString(_themeStorageKey) ?? 'light';
    themeMode.value = _fromString(stored);
  }

  static ThemeMode _fromString(String value) {
    switch (value.toLowerCase()) {
      case 'dark':
        return ThemeMode.dark;
      case 'light':
      default:
        return ThemeMode.light;
    }
  }

  static String toPreferenceString(ThemeMode mode) {
    switch (mode) {
      case ThemeMode.dark:
        return 'dark';
      case ThemeMode.light:
      case ThemeMode.system:
        return 'light';
    }
  }

  static Future<void> setThemeMode(ThemeMode mode) async {
    themeMode.value = mode;

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_themeStorageKey, toPreferenceString(mode));
  }

  static Future<void> setThemePreferenceString(String value) async {
    await setThemeMode(_fromString(value));
  }
}
