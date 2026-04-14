import 'package:flutter/material.dart';

class AppHeader extends StatelessWidget {
  final String title;

  const AppHeader({
    super.key,
    required this.title,
  });

  @override
  Widget build(BuildContext context) {
    final topInset = MediaQuery.of(context).padding.top;

    return Container(
      width: double.infinity,
      color: const Color(0xFFEAEAEA),
      padding: EdgeInsets.fromLTRB(16, topInset + 18, 16, 14),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 26,
          fontWeight: FontWeight.w700,
          color: Colors.black,
          letterSpacing: 0.2,
        ),
      ),
    );
  }
}
