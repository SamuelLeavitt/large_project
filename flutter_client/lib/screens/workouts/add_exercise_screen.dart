import 'package:flutter/material.dart';

import '../../services/workout_service.dart';
import '../../theme/app_styles.dart';
import '../../widgets/app_buttons.dart';
import '../../widgets/app_cards.dart';
import '../../widgets/app_feedback.dart';
import '../../widgets/exercise_widgets.dart';

class AddExerciseScreenForWorkout extends StatelessWidget {
  const AddExerciseScreenForWorkout({super.key});

  @override
  Widget build(BuildContext context) {
    return const AddExerciseScreen(existingExerciseIds: {});
  }
}

class AddExerciseScreen extends StatefulWidget {
  final Set<String> existingExerciseIds;

  const AddExerciseScreen({
    super.key,
    required this.existingExerciseIds,
  });

  @override
  State<AddExerciseScreen> createState() => _AddExerciseScreenState();
}

class _AddExerciseScreenState extends State<AddExerciseScreen> {
  bool _loadingFilters = true;
  bool _loadingExercises = true;
  String? _error;
  String _selectedMuscle = '';
  String _search = '';
  List<String> _muscles = [];
  List<ExerciseModel> _exercises = [];

  @override
  void initState() {
    super.initState();
    _loadInitial();
  }

  Future<void> _loadInitial() async {
    setState(() {
      _loadingFilters = true;
      _loadingExercises = true;
      _error = null;
    });

    try {
      final filters = await WorkoutService.fetchExerciseFilters();
      if (!mounted) return;

      setState(() {
        _muscles = filters.primaryMuscles;
        _loadingFilters = false;
      });

      await _loadExercises();
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString().replaceFirst('Exception: ', '');
        _loadingFilters = false;
        _loadingExercises = false;
      });
    }
  }

  Future<void> _loadExercises() async {
    setState(() {
      _loadingExercises = true;
      _error = null;
    });

    try {
      final results = await WorkoutService.fetchExercises(
        search: _search,
        muscle: _selectedMuscle,
        limit: 50,
      );

      if (!mounted) return;
      setState(() {
        _exercises = results.items;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString().replaceFirst('Exception: ', '');
      });
    } finally {
      if (!mounted) return;
      setState(() {
        _loadingExercises = false;
      });
    }
  }

  void _addExercise(ExerciseModel exercise) {
    if (widget.existingExerciseIds.contains(exercise.id)) return;

    final bodyPart = exercise.primaryMuscles.isNotEmpty
        ? exercise.primaryMuscles.first
        : 'Custom';

    Navigator.pop(
      context,
      WorkoutTemplateExercise(
        exerciseId: exercise.id,
        name: exercise.name,
        category: exercise.category,
        bodyPart: bodyPart,
        sets: 3,
        reps: '10',
      ),
    );
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
          onPressed: () => Navigator.pop(context),
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          color: Colors.black,
        ),
        title: const Text(
          'Add Exercise',
          style: TextStyle(
            color: Colors.black,
            fontWeight: FontWeight.w700,
          ),
        ),
        centerTitle: true,
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
        children: [
          const Text(
            'Pick a muscle group and search exercises.',
            style: TextStyle(
              fontSize: 16,
              color: Color(0xFF6E6A7C),
            ),
          ),
          const SizedBox(height: 16),
          SectionCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Muscle Group', style: kLabelStyle),
                const SizedBox(height: 12),
                if (_loadingFilters)
                  const Center(child: CircularProgressIndicator())
                else
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _muscles
                        .map(
                          (muscle) => ChoiceChip(
                            label: Text(titleCase(muscle)),
                            selected: _selectedMuscle == muscle,
                            onSelected: (_) {
                              setState(() {
                                _selectedMuscle = muscle == _selectedMuscle ? '' : muscle;
                              });
                              _loadExercises();
                            },
                          ),
                        )
                        .toList(),
                  ),
                const SizedBox(height: 16),
                TextField(
                  decoration: appTextFieldDecoration('Search exercises'),
                  onChanged: (value) {
                    _search = value;
                  },
                  onSubmitted: (_) => _loadExercises(),
                ),
                const SizedBox(height: 12),
                SmallPillButton(
                  label: 'Search',
                  onTap: _loadExercises,
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          if (_error != null)
            SectionCard(
              child: ErrorBlock(
                message: _error!,
                onRetry: _loadInitial,
              ),
            )
          else if (_loadingExercises)
            const SectionCard(child: LoadingBlock())
          else if (_exercises.isEmpty)
            const SectionCard(
              child: EmptyStateText('No exercises found in this body zone.'),
            )
          else
            SectionCard(
              child: Column(
                children: _exercises.map((exercise) {
                  final alreadyAdded =
                      widget.existingExerciseIds.contains(exercise.id);

                  return Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFD9D9D9)),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  exercise.name,
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  exercise.primaryMuscles.isEmpty
                                      ? 'N/A'
                                      : exercise.primaryMuscles.join(', '),
                                  style: const TextStyle(
                                    color: Color(0xFF6E6A7C),
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  exercise.equipment.isEmpty
                                      ? 'N/A'
                                      : exercise.equipment,
                                  style: const TextStyle(
                                    color: Color(0xFF8A8694),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 8),
                          Column(
                            children: [
                              IconPillButton(
                                icon: Icons.info_outline,
                                onTap: () => showExerciseDetailsSheet(context, exercise),
                                tooltip: 'Details',
                              ),
                              const SizedBox(height: 8),
                              IconPillButton(
                                icon: alreadyAdded ? Icons.check : Icons.add,
                                onTap: alreadyAdded ? () {} : () => _addExercise(exercise),
                                tooltip: alreadyAdded ? 'Added' : 'Add',
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
        ],
      ),
    );
  }
}
