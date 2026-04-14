import 'package:flutter/material.dart';

import '../../services/workout_service.dart';
import '../../theme/app_styles.dart';
import '../../widgets/app_buttons.dart';
import '../../widgets/app_cards.dart';
import 'add_exercise_screen.dart';

class TemplateEditorScreen extends StatefulWidget {
  final WorkoutTemplateSummary? template;

  const TemplateEditorScreen({
    super.key,
    this.template,
  });

  @override
  State<TemplateEditorScreen> createState() => _TemplateEditorScreenState();
}

class _TemplateEditorScreenState extends State<TemplateEditorScreen> {
  late final TextEditingController _nameController;
  String _bodyPart = 'Custom';
  bool _saving = false;
  bool _deleting = false;
  late List<WorkoutTemplateExercise> _exercises;

  bool get _isEditing => widget.template != null;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.template?.name ?? '');
    _bodyPart = (widget.template?.bodyPart.isNotEmpty ?? false)
        ? widget.template!.bodyPart
        : 'Custom';
    _exercises = [...(widget.template?.exercises ?? const <WorkoutTemplateExercise>[])];
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _openAddExercise() async {
    final selected = await Navigator.push<WorkoutTemplateExercise>(
      context,
      MaterialPageRoute(
        builder: (_) => AddExerciseScreen(
          existingExerciseIds: _exercises.map((e) => e.exerciseId).toSet(),
        ),
      ),
    );

    if (selected == null || !mounted) return;

    setState(() {
      _exercises.add(selected);
      if (_bodyPart == 'Custom' &&
          selected.bodyPart.trim().isNotEmpty &&
          selected.bodyPart.trim().toLowerCase() != 'all') {
        _bodyPart = selected.bodyPart;
      }
    });
  }

  void _removeExercise(int index) {
    setState(() {
      _exercises.removeAt(index);
    });
  }

  void _updateExerciseSets(int index, String value) {
    final parsed = int.tryParse(value.trim()) ?? 0;
    setState(() {
      _exercises[index] = _exercises[index].copyWith(
        sets: parsed <= 0 ? 1 : parsed,
      );
    });
  }

  void _updateExerciseReps(int index, String value) {
    setState(() {
      _exercises[index] = _exercises[index].copyWith(
        reps: value.trim().isEmpty ? '0' : value.trim(),
      );
    });
  }

  Future<void> _saveTemplate() async {
    if (_saving) return;

    final name = _nameController.text.trim();
    if (name.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Workout name is required.')),
      );
      return;
    }

    setState(() {
      _saving = true;
    });

    try {
      if (_isEditing) {
        await WorkoutService.updateTemplate(
          id: widget.template!.id,
          name: name,
          bodyPart: _bodyPart,
          exercises: _exercises,
        );
      } else {
        await WorkoutService.createTemplate(
          name: name,
          bodyPart: _bodyPart,
          exercises: _exercises,
        );
      }

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(_isEditing ? 'Template updated.' : 'Template created.'),
        ),
      );
      Navigator.pop(context);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
      );
    } finally {
      if (!mounted) return;
      setState(() {
        _saving = false;
      });
    }
  }

  Future<void> _deleteTemplate() async {
    if (!_isEditing || _deleting) return;

    setState(() {
      _deleting = true;
    });

    try {
      await WorkoutService.deleteTemplate(widget.template!.id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Template deleted.')),
      );
      Navigator.pop(context);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceFirst('Exception: ', ''))),
      );
    } finally {
      if (!mounted) return;
      setState(() {
        _deleting = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final bodyPartOptions = <String>{
      'Custom',
      ..._exercises
          .map((e) => e.bodyPart.trim().isEmpty ? 'Custom' : e.bodyPart)
          .toList(),
    }.toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF6F6F6),
      appBar: AppBar(
        backgroundColor: const Color(0xFFF6F6F6),
        surfaceTintColor: const Color(0xFFF6F6F6),
        elevation: 0,
        leading: IconButton(
          onPressed: (_saving || _deleting) ? null : () => Navigator.pop(context),
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          color: Colors.black,
        ),
        title: Text(
          _isEditing ? 'Edit Template' : 'Create Template',
          style: const TextStyle(
            color: Colors.black,
            fontWeight: FontWeight.w700,
          ),
        ),
        centerTitle: true,
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
        children: [
          SectionCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Workout Name', style: kLabelStyle),
                const SizedBox(height: 10),
                TextField(
                  controller: _nameController,
                  decoration: appTextFieldDecoration('Example: Push Day A'),
                ),
                const SizedBox(height: 14),
                const Text('Body Zone', style: kLabelStyle),
                const SizedBox(height: 10),
                DropdownButtonFormField<String>(
                  value: bodyPartOptions.contains(_bodyPart) ? _bodyPart : bodyPartOptions.first,
                  items: bodyPartOptions
                      .map(
                        (option) => DropdownMenuItem(
                          value: option,
                          child: Text(option),
                        ),
                      )
                      .toList(),
                  onChanged: (value) {
                    setState(() {
                      _bodyPart = value ?? 'Custom';
                    });
                  },
                  decoration: appTextFieldDecoration('Select body zone'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          SectionCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Expanded(
                      child: Text(
                        'Exercises',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    SmallPillButton(
                      label: 'Add Exercise',
                      onTap: _openAddExercise,
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                if (_exercises.isEmpty)
                  const EmptyStateText('No exercises added yet.')
                else
                  Column(
                    children: List.generate(_exercises.length, (index) {
                      final exercise = _exercises[index];

                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(color: const Color(0xFFD9D9D9)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Expanded(
                                    child: Text(
                                      exercise.name,
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ),
                                  IconButton(
                                    onPressed: () => _removeExercise(index),
                                    icon: const Icon(Icons.close_rounded),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(
                                exercise.bodyPart.isEmpty ? 'Custom' : exercise.bodyPart,
                                style: const TextStyle(
                                  color: Color(0xFF6E6A7C),
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 12),
                              Row(
                                children: [
                                  Expanded(
                                    child: TextField(
                                      keyboardType: TextInputType.number,
                                      controller: TextEditingController(
                                        text: '${exercise.sets}',
                                      ),
                                      decoration: appTextFieldDecoration('Sets'),
                                      onChanged: (value) => _updateExerciseSets(index, value),
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: TextField(
                                      controller: TextEditingController(
                                        text: exercise.reps,
                                      ),
                                      decoration: appTextFieldDecoration('Reps'),
                                      onChanged: (value) => _updateExerciseReps(index, value),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    }),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 22),
          Row(
            children: [
              if (_isEditing) ...[
                Expanded(
                  child: DangerPillButton(
                    label: _deleting ? 'Deleting...' : 'Delete',
                    onTap: (_saving || _deleting) ? null : _deleteTemplate,
                  ),
                ),
                const SizedBox(width: 12),
              ],
              Expanded(
                child: PillButton(
                  label: 'Cancel',
                  onTap: (_saving || _deleting) ? () {} : () => Navigator.pop(context),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: PrimaryPillButton(
                  label: _saving ? 'Saving...' : (_isEditing ? 'Save Changes' : 'Create Plan'),
                  onTap: (_saving || _deleting) ? null : _saveTemplate,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
