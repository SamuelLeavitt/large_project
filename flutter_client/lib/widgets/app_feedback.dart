import 'package:flutter/material.dart';
import 'app_buttons.dart';

class LoadingBlock extends StatelessWidget {
  const LoadingBlock({super.key});

  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.symmetric(vertical: 12),
      child: Center(child: CircularProgressIndicator()),
    );
  }
}

class ErrorBlock extends StatelessWidget {
  final String message;
  final Future<void> Function() onRetry;

  const ErrorBlock({
    super.key,
    required this.message,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          message,
          style: const TextStyle(
            fontSize: 15,
            color: Colors.red,
          ),
        ),
        const SizedBox(height: 12),
        SmallPillButton(
          label: 'Retry',
          onTap: () {
            onRetry();
          },
        ),
      ],
    );
  }
}
