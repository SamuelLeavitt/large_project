import 'package:flutter/material.dart';
import '../services/workout_service.dart';
import '../theme/app_styles.dart';

class InfoChip extends StatelessWidget {
  final String text;

  const InfoChip(this.text, {super.key});

  @override
  Widget build(BuildContext context) {
    return Chip(
      label: Text(titleCase(text)),
      backgroundColor: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(999),
        side: const BorderSide(color: Color(0xFFD8D8D8)),
      ),
    );
  }
}

class InfoRow extends StatelessWidget {
  final String label;
  final String value;

  const InfoRow({
    super.key,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontWeight: FontWeight.w700,
            color: Color(0xFF4F4A5B),
          ),
        ),
        const SizedBox(height: 4),
        Text(value),
      ],
    );
  }
}

class MiniTag extends StatelessWidget {
  final String text;

  const MiniTag(this.text, {super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(
        color: const Color(0xFFEEDFFC),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: Color(0xFF8A42FF),
        ),
      ),
    );
  }
}

class ExerciseRow extends StatelessWidget {
  final ExerciseModel exercise;
  final VoidCallback onTap;

  const ExerciseRow({
    super.key,
    required this.exercise,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final primary = exercise.primaryMuscles.take(2).map(titleCase).join(', ');
    final metaParts = <String>[
      if (primary.isNotEmpty) primary,
      if (exercise.equipment.isNotEmpty) titleCase(exercise.equipment),
    ];

    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFFF8F8F6),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFD9D9D9)),
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      exercise.name,
                      style: const TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w700,
                        color: Colors.black,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      metaParts.join(' · '),
                      style: const TextStyle(
                        fontSize: 14,
                        color: Color(0xFF9D62FF),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  if (exercise.level.isNotEmpty) ...[
                    MiniTag(titleCase(exercise.level)),
                    const SizedBox(height: 6),
                  ],
                  if (exercise.category.isNotEmpty)
                    MiniTag(titleCase(exercise.category)),
                ],
              ),
              const SizedBox(width: 10),
              const Icon(
                Icons.chevron_right_rounded,
                color: Color(0xFFC39BFF),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

Future<void> showExerciseDetailsSheet(
  BuildContext context,
  ExerciseModel exercise,
) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    backgroundColor: const Color(0xFFF8F8F6),
    builder: (_) => Padding(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 30),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              exercise.name,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                if (exercise.level.isNotEmpty) InfoChip(exercise.level),
                if (exercise.category.isNotEmpty) InfoChip(exercise.category),
                if (exercise.force.isNotEmpty) InfoChip(exercise.force),
              ],
            ),
            const SizedBox(height: 20),
            InfoRow(
              label: 'Equipment',
              value: exercise.equipment.isEmpty ? '—' : titleCase(exercise.equipment),
            ),
            const SizedBox(height: 12),
            InfoRow(
              label: 'Primary Muscles',
              value: exercise.primaryMuscles.isEmpty
                  ? '—'
                  : exercise.primaryMuscles.map(titleCase).join(', '),
            ),
            const SizedBox(height: 12),
            InfoRow(
              label: 'Secondary Muscles',
              value: exercise.secondaryMuscles.isEmpty
                  ? '—'
                  : exercise.secondaryMuscles.map(titleCase).join(', '),
            ),
            const SizedBox(height: 20),
            const Text(
              'Instructions',
              style: TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 10),
            if (exercise.instructions.isEmpty)
              const Text('No instructions available.')
            else
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: List.generate(
                  exercise.instructions.length,
                  (index) => Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Text('${index + 1}. ${exercise.instructions[index]}'),
                  ),
                ),
              ),
          ],
        ),
      ),
    ),
  );
}
