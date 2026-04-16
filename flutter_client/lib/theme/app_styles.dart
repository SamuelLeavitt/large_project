import 'package:flutter/material.dart';

TextStyle labelStyle(BuildContext context) {
  final theme = Theme.of(context);
  return theme.textTheme.bodyMedium!.copyWith(
    fontSize: 14,
    fontWeight: FontWeight.w700,
    color: theme.colorScheme.onSurface,
  );
}

InputDecoration appTextFieldDecoration(BuildContext context, String hint) {
  final theme = Theme.of(context);

  return InputDecoration(
    hintText: hint,
    filled: true,
    fillColor: theme.colorScheme.surface,
    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(16),
      borderSide: BorderSide(color: theme.dividerColor),
    ),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(16),
      borderSide: BorderSide(color: theme.dividerColor),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(16),
      borderSide: BorderSide(color: theme.colorScheme.primary),
    ),
  );
}

String titleCase(String value) {
  if (value.trim().isEmpty) return value;
  return value
      .split(RegExp(r'\s+'))
      .map((word) {
        if (word.isEmpty) return word;
        return '${word[0].toUpperCase()}${word.substring(1)}';
      })
      .join(' ');
}
