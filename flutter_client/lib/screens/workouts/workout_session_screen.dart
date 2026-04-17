import 'dart:async';

import 'package:flutter/material.dart';

import '../../services/auth_service.dart';
import '../../services/workout_service.dart';
import '../../theme/app_styles.dart';
import '../../widgets/app_buttons.dart';
import '../../widgets/app_cards.dart';
import '../workouts/add_exercise_screen.dart';

class WorkoutSessionScreen extends StatefulWidget {
  final WorkoutTemplateSummary? template;

  const WorkoutSessionScreen({
    super.key,
    this.template,
  });

  @override
  State<WorkoutSessionScreen> createState() => _WorkoutSessionScreenState();
}

class _WorkoutSessionScreenState extends State<WorkoutSessionScreen> {
  late final TextEditingController _nameController;
  Timer? _timer;
  int _elapsedSeconds = 0;
  bool _isRunning = false;
  bool _saving = false;

  late List<ActiveWorkoutExercise> _exercises;

  bool get _fromTemplate => widget.template != null;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(
      text: widget.template?.name ?? 'Empty Workout',
    );

    _exercises = (widget.template?.exercises ?? [])
        .map(
          (exercise) => ActiveWorkoutExercise(
            exerciseId: exercise.exerciseId,
            name: exercise.name,
            sets: List.generate(
              exercise.sets <= 0 ? 1 : exercise.sets,
              (_) => const LoggedSetDraft(weight: 0, reps: 0),
            ),
          ),
        )
        .toList();

    _startTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _nameController.dispose();
    super.dispose();
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!_isRunning || !mounted) return;
      setState(() {
        _elapsedSeconds += 1;
      });
    });
  }

  void _toggleStopwatch() {
    setState(() {
      _isRunning = !_isRunning;
    });
  }

  void _resetStopwatch() {
    setState(() {
      _elapsedSeconds = 0;
    });
  }

  String _formatStopwatch(int totalSeconds) {
    final minutes = totalSeconds ~/ 60;
    final seconds = totalSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  Future<void> _openAddExercise() async {
    final selected = await Navigator.push<WorkoutTemplateExercise>(
      context,
      MaterialPageRoute(
        builder: (_) => const AddExerciseScreenForWorkout(),
      ),
    );

    if (selected == null || !mounted) return;

    setState(() {
      _exercises.add(
        ActiveWorkoutExercise(
          exerciseId: selected.exerciseId,
          name: selected.name,
          sets: List.generate(
            selected.sets <= 0 ? 1 : selected.sets,
            (_) => const LoggedSetDraft(weight: 0, reps: 0),
          ),
        ),
      );
    });
  }

  void _addSet(int exerciseIndex) {
    setState(() {
      final exercise = _exercises[exerciseIndex];
      final updatedSets = [...exercise.sets, const LoggedSetDraft(weight: 0, reps: 0)];
      _exercises[exerciseIndex] = ActiveWorkoutExercise(
        exerciseId: exercise.exerciseId,
        name: exercise.name,
        sets: updatedSets,
      );
    });
  }

  void _removeSet(int exerciseIndex, int setIndex) {
    setState(() {
      final exercise = _exercises[exerciseIndex];
      final updatedSets = [...exercise.sets]..removeAt(setIndex);
      _exercises[exerciseIndex] = ActiveWorkoutExercise(
        exerciseId: exercise.exerciseId,
        name: exercise.name,
        sets: updatedSets,
      );
    });
  }

  void _updateSet(int exerciseIndex, int setIndex, String field, String value) {
    final parsed = int.tryParse(value.trim()) ?? 0;

    setState(() {
      final exercise = _exercises[exerciseIndex];
      final sets = [...exercise.sets];
      final current = sets[setIndex];

      sets[setIndex] = current.copyWith(
        weight: field == 'weight' ? parsed : current.weight,
        reps: field == 'reps' ? parsed : current.reps,
      );

      _exercises[exerciseIndex] = ActiveWorkoutExercise(
        exerciseId: exercise.exerciseId,
        name: exercise.name,
        sets: sets,
      );
    });
  }

  void _removeExercise(int index) {
    setState(() {
      _exercises.removeAt(index);
    });
  }

  Future<void> _finishWorkout() async {
    if (_saving) return;

    final workoutName = _nameController.text.trim().isEmpty
        ? (_fromTemplate ? widget.template!.name : 'Empty Workout')
        : _nameController.text.trim();

    setState(() {
      _saving = true;
    });

    try {
      await WorkoutService.saveQuickStartSession(
        workoutName: workoutName,
        durationSeconds: _elapsedSeconds,
        exercises: _exercises,
        sourceType: _fromTemplate ? 'template' : 'quickStart',
        templateId: widget.template?.id,
        templateName: widget.template?.name,
      );

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Workout saved.')),
      );
      Navigator.pop(context);
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF6F6F6),
      appBar: AppBar(
        backgroundColor: const Color(0xFFF6F6F6),
        surfaceTintColor: const Color(0xFFF6F6F6),
        elevation: 0,
        leading: IconButton(
          onPressed: _saving ? null : () => Navigator.pop(context),
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          color: Colors.black,
        ),
        title: Text(
          _fromTemplate ? 'Start Plan' : 'Empty Workout',
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
                Text('Workout Name', style: labelStyle(context)),
                const SizedBox(height: 10),
                TextField(
                  controller: _nameController,
                  decoration: appTextFieldDecoration(context, 'Enter workout name'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          SectionCard(
            child: Column(
              children: [
                Text('Stopwatch', style: labelStyle(context)),
                const SizedBox(height: 12),
                Text(
                  _formatStopwatch(_elapsedSeconds),
                  style: const TextStyle(
                    fontSize: 34,
                    fontWeight: FontWeight.w700,
                    color: Colors.black,
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Expanded(
                      child: SmallPillButton(
                        label: _isRunning ? 'Pause' : (_elapsedSeconds == 0 ? 'Start' : 'Resume'),
                        onTap: _toggleStopwatch,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: SmallPillButton(
                        label: 'Reset',
                        onTap: _resetStopwatch,
                      ),
                    ),
                  ],
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
                          color: Colors.black,
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
                    children: List.generate(_exercises.length, (exerciseIndex) {
                      final exercise = _exercises[exerciseIndex];

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
                                    onPressed: () => _removeExercise(exerciseIndex),
                                    icon: const Icon(Icons.close_rounded),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              if (exercise.sets.isEmpty)
                                const Text(
                                  'No sets logged yet.',
                                  style: TextStyle(color: Color(0xFF6E6A7C)),
                                )
                              else
                                Column(
                                  children: List.generate(exercise.sets.length, (setIndex) {
                                    final set = exercise.sets[setIndex];

                                    return Padding(
                                      padding: const EdgeInsets.only(bottom: 10),
                                      child: Container(
                                        padding: const EdgeInsets.all(12),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFF7F7F4),
                                          borderRadius: BorderRadius.circular(12),
                                          border: Border.all(color: const Color(0xFFE1E1E1)),
                                        ),
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Row(
                                              children: [
                                                Text(
                                                  'Set ${setIndex + 1}',
                                                  style: const TextStyle(
                                                    fontWeight: FontWeight.w700,
                                                  ),
                                                ),
                                                const Spacer(),
                                                if (exercise.sets.length > 1)
                                                  IconButton(
                                                    onPressed: () =>
                                                        _removeSet(exerciseIndex, setIndex),
                                                    icon: const Icon(
                                                      Icons.delete_outline,
                                                      size: 20,
                                                    ),
                                                  ),
                                              ],
                                            ),
                                            Row(
                                              children: [
                                                Expanded(
                                                  child: TextFormField(
                                                      key: ValueKey('weight_${exercise.exerciseId}_$setIndex'),
                                                      keyboardType: TextInputType.number,
                                                      initialValue: set.weight == 0 ? '' : '${set.weight}',
                                                      decoration: appTextFieldDecoration(context, 'lbs'),
                                                      onChanged: (value) => _updateSet(
                                                        exerciseIndex,
                                                        setIndex,
                                                        'weight',
                                                        value,
                                                      ),
                                                  ),
                                                ),
                                                const SizedBox(width: 10),
                                                Expanded(
                                                  child: TextFormField(
                                                    key: ValueKey('reps_${exercise.exerciseId}_$setIndex'),
                                                    keyboardType: TextInputType.number,
                                                    initialValue: set.reps == 0 ? '' : '${set.reps}',
                                                    decoration: appTextFieldDecoration(context, 'reps'),
                                                    onChanged: (value) => _updateSet(
                                                      exerciseIndex,
                                                      setIndex,
                                                      'reps',
                                                      value,
                                                    ),
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
                              const SizedBox(height: 8),
                              SmallPillButton(
                                label: '+ Add Set',
                                onTap: () => _addSet(exerciseIndex),
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
              Expanded(
                child: PillButton(
                  label: 'Cancel',
                  onTap: _saving ? () {} : () => Navigator.pop(context),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: PrimaryPillButton(
                  label: _saving ? 'Saving...' : 'Finish Workout',
                  onTap: _saving ? null : _finishWorkout,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
