import 'package:flutter/material.dart';

class SectionCard extends StatelessWidget {
  final Widget child;

  const SectionCard({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFF1F1ED),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFDADADA)),
      ),
      padding: const EdgeInsets.all(20),
      child: child,
    );
  }
}

class TabPageScaffold extends StatelessWidget {
  final Widget child;

  const TabPageScaffold({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      color: const Color(0xFFF6F6F6),
      child: child,
    );
  }
}

class EmptyStateText extends StatelessWidget {
  final String text;

  const EmptyStateText(this.text, {super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFD9D9D9)),
      ),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 15,
          color: Color(0xFF6E6A7C),
        ),
      ),
    );
  }
}
