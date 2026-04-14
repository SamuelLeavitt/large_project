import 'package:flutter/material.dart';

class PillButton extends StatelessWidget {
  final String label;
  final VoidCallback onTap;

  const PillButton({
    super.key,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: const Color(0xFFF1F1ED),
      borderRadius: BorderRadius.circular(999),
      child: InkWell(
        borderRadius: BorderRadius.circular(999),
        onTap: onTap,
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 15),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(999),
            border: Border.all(color: const Color(0xFFD4D4D4)),
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: Color(0xFF6F6A7C),
            ),
          ),
        ),
      ),
    );
  }
}

class SmallPillButton extends StatelessWidget {
  final String label;
  final VoidCallback onTap;

  const SmallPillButton({
    super.key,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: const Color(0xFFF1F1ED),
      borderRadius: BorderRadius.circular(999),
      child: InkWell(
        borderRadius: BorderRadius.circular(999),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(999),
            border: Border.all(color: const Color(0xFFD4D4D4)),
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Color(0xFF6F6A7C),
            ),
          ),
        ),
      ),
    );
  }
}

class PrimaryPillButton extends StatelessWidget {
  final String label;
  final VoidCallback? onTap;

  const PrimaryPillButton({
    super.key,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: onTap == null ? const Color(0xFFB7CAE4) : const Color(0xFF3B82F6),
      borderRadius: BorderRadius.circular(999),
      child: InkWell(
        borderRadius: BorderRadius.circular(999),
        onTap: onTap,
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 15),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: Colors.white,
            ),
          ),
        ),
      ),
    );
  }
}

class DangerPillButton extends StatelessWidget {
  final String label;
  final VoidCallback? onTap;

  const DangerPillButton({
    super.key,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: onTap == null ? const Color(0xFFE7BFC1) : const Color(0xFFD64545),
      borderRadius: BorderRadius.circular(999),
      child: InkWell(
        borderRadius: BorderRadius.circular(999),
        onTap: onTap,
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 15),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: Colors.white,
            ),
          ),
        ),
      ),
    );
  }
}

class IconPillButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  final String tooltip;

  const IconPillButton({
    super.key,
    required this.icon,
    required this.onTap,
    required this.tooltip,
  });

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: Material(
        color: const Color(0xFFF1F1ED),
        borderRadius: BorderRadius.circular(999),
        child: InkWell(
          borderRadius: BorderRadius.circular(999),
          onTap: onTap,
          child: Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(999),
              border: Border.all(color: const Color(0xFFD4D4D4)),
            ),
            child: Icon(
              icon,
              size: 20,
              color: const Color(0xFF6F6A7C),
            ),
          ),
        ),
      ),
    );
  }
}
