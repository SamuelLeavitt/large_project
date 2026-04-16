import 'package:flutter/material.dart';

import '../../services/auth_service.dart';
import '../../services/workout_service.dart';
import '../../widgets/app_buttons.dart';
import '../../widgets/app_cards.dart';
import '../../widgets/app_feedback.dart';
import '../workouts/template_editor_screen.dart';
import '../workouts/workout_session_screen.dart';

class WorkoutHomeTab extends StatefulWidget {
  const WorkoutHomeTab({super.key});

  @override
  State<WorkoutHomeTab> createState() => _WorkoutHomeTabState();
}

class _WorkoutHomeTabState extends State<WorkoutHomeTab> {
  bool _loading = true;
  String? _error;
  List<WorkoutTemplateSummary> _templates = [];

  @override
  void initState() {
    super.initState();
    _loadTemplates();
  }

  Future<void> _loadTemplates() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final templates = await WorkoutService.fetchTemplates();
      if (!mounted) return;

      setState(() {
        _templates = templates;
      });
    } catch (e) {
      if (!mounted) return;

      if (e is SessionExpiredException) {
          Navigator.pushNamedAndRemoveUntil(context, '/login', (_) => false);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Your session expired. Please log in again.'),
            ),
          );
          return;
      }

      setState(() {
        _error = e.toString().replaceFirst('Exception: ', '');
      });
    } finally {
      if (!mounted) return;
      setState(() {
        _loading = false;
      });
    }
  }

  Future<void> _openEmptyWorkout() async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => const WorkoutSessionScreen(),
      ),
    );

    if (!mounted) return;
    _loadTemplates();
  }

  Future<void> _openCreateTemplate() async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => const TemplateEditorScreen(),
      ),
    );

    if (!mounted) return;
    _loadTemplates();
  }

  Future<void> _openEditTemplate(WorkoutTemplateSummary template) async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => TemplateEditorScreen(template: template),
      ),
    );

    if (!mounted) return;
    _loadTemplates();
  }

  Future<void> _startFromTemplate(WorkoutTemplateSummary template) async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => WorkoutSessionScreen(template: template),
      ),
    );

    if (!mounted) return;
    _loadTemplates();
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _loadTemplates,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
        children: [
          const SizedBox(height: 6),
          const Center(
            child: Text(
              'Workout',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.w500,
                color: Colors.black,
              ),
            ),
          ),
          const SizedBox(height: 22),
          Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 340),
              child: PillButton(
                label: 'Start an Empty Workout',
                onTap: _openEmptyWorkout,
              ),
            ),
          ),
          const SizedBox(height: 28),
          SectionCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Expanded(
                      child: Text(
                        'Saved Plans',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                          color: Colors.black,
                        ),
                      ),
                    ),
                    SmallPillButton(
                      label: 'Create a Plan',
                      onTap: _openCreateTemplate,
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                if (_loading)
                  const LoadingBlock()
                else if (_error != null)
                  ErrorBlock(
                    message: _error!,
                    onRetry: _loadTemplates,
                  )
                else if (_templates.isEmpty)
                  const Text(
                    'No plans saved.',
                    style: TextStyle(
                      fontSize: 16,
                      color: Color(0xFF6E6A7C),
                    ),
                  )
                else
                  Column(
                    children: _templates
                        .map(
                          (template) => Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: _TemplateCard(
                              template: template,
                              onStart: () => _startFromTemplate(template),
                              onEdit: () => _openEditTemplate(template),
                            ),
                          ),
                        )
                        .toList(),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _TemplateCard extends StatelessWidget {
  final WorkoutTemplateSummary template;
  final VoidCallback onStart;
  final VoidCallback onEdit;

  const _TemplateCard({
    required this.template,
    required this.onStart,
    required this.onEdit,
  });

  @override
  Widget build(BuildContext context) {
    final count = template.exerciseCount;

    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(18),
      child: InkWell(
        borderRadius: BorderRadius.circular(18),
        onTap: onStart,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFFF8F8F6),
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: const Color(0xFFD9D9D9)),
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      template.name,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: Colors.black,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      template.bodyPart.isEmpty ? 'Custom' : template.bodyPart,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF6E6A7C),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      count == 1 ? '1 exercise' : '$count exercises',
                      style: const TextStyle(
                        fontSize: 14,
                        color: Color(0xFF8A8694),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Column(
                children: [
                  IconPillButton(
                    icon: Icons.play_arrow_rounded,
                    onTap: onStart,
                    tooltip: 'Start workout',
                  ),
                  const SizedBox(height: 8),
                  IconPillButton(
                    icon: Icons.edit_outlined,
                    onTap: onEdit,
                    tooltip: 'Edit template',
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
