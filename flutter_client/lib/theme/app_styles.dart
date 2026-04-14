import 'package:flutter/material.dart';

const TextStyle kLabelStyle = TextStyle(
  fontSize: 14,
  fontWeight: FontWeight.w700,
  color: Color(0xFF4F4A5B),
);

InputDecoration appTextFieldDecoration(String hint) {
  return InputDecoration(
    hintText: hint,
    filled: true,
    fillColor: Colors.white,
    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(16),
      borderSide: const BorderSide(color: Color(0xFFD8D8D8)),
    ),
    enabledBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(16),
      borderSide: const BorderSide(color: Color(0xFFD8D8D8)),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(16),
      borderSide: const BorderSide(color: Color(0xFFB9B9B9)),
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
