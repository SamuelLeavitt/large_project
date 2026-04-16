import 'package:flutter/material.dart';

import '../../services/workout_service.dart';
import '../../theme/app_styles.dart';
import '../../widgets/app_buttons.dart';
import '../../widgets/app_cards.dart';
import '../../widgets/app_feedback.dart';
import '../../widgets/exercise_widgets.dart';

class SearchExercisesTab extends StatefulWidget {
  const SearchExercisesTab({super.key});

  @override
  State<SearchExercisesTab> createState() => _SearchExercisesTabState();
}

class _SearchExercisesTabState extends State<SearchExercisesTab> {
  final TextEditingController _searchController = TextEditingController();

  bool _loadingFilters = true;
  bool _loadingResults = true;
  String? _error;

  List<String> _categories = [];
  List<String> _levels = [];
  List<String> _equipment = [];

  String _selectedCategory = '';
  String _selectedLevel = '';
  String _selectedEquipment = '';

  List<ExerciseModel> _exercises = [];
  int _total = 0;
  int _page = 1;
  int _pages = 1;

  @override
  void initState() {
    super.initState();
    _loadInitial();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadInitial() async {
    setState(() {
      _loadingFilters = true;
      _error = null;
    });

    try {
      final filters = await WorkoutService.fetchExerciseFilters();
      if (!mounted) return;

      setState(() {
        _categories = filters.categories;
        _levels = filters.levels;
        _equipment = filters.equipment;
        _loadingFilters = false;
      });

      await _loadExercises();
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loadingFilters = false;
        _loadingResults = false;
        _error = e.toString().replaceFirst('Exception: ', '');
      });
    }
  }

  Future<void> _loadExercises() async {
    setState(() {
      _loadingResults = true;
      _error = null;
    });

    try {
      final results = await WorkoutService.fetchExercises(
        search: _searchController.text,
        category: _selectedCategory,
        level: _selectedLevel,
        equipment: _selectedEquipment,
        page: _page,
        limit: 20,
      );

      if (!mounted) return;
      setState(() {
        _exercises = results.items;
        _total = results.total;
        _page = results.page;
        _pages = results.pages;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString().replaceFirst('Exception: ', '');
      });
    } finally {
      if (!mounted) return;
      setState(() {
        _loadingResults = false;
      });
    }
  }

  void _applySearch() {
    setState(() {
      _page = 1;
    });
    _loadExercises();
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _loadInitial,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
        children: [
          const Center(
            child: Text(
              'Exercise Library',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: Colors.black,
              ),
            ),
          ),
          const SizedBox(height: 18),
          if (_loadingFilters)
            const SectionCard(
              child: Padding(
                padding: EdgeInsets.symmetric(vertical: 24),
                child: Center(child: CircularProgressIndicator()),
              ),
            )
          else
            Column(
              children: [
                TextField(
                  controller: _searchController,
                  textInputAction: TextInputAction.search,
                  decoration: appTextFieldDecoration(context, 'Search exercises...'),
                  onSubmitted: (_) => _applySearch(),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: _FilterDropdown(
                        value: _selectedCategory,
                        hint: 'All categories',
                        items: _categories,
                        onChanged: (value) {
                          setState(() {
                            _selectedCategory = value ?? '';
                            _page = 1;
                          });
                          _loadExercises();
                        },
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _FilterDropdown(
                        value: _selectedLevel,
                        hint: 'All levels',
                        items: _levels,
                        onChanged: (value) {
                          setState(() {
                            _selectedLevel = value ?? '';
                            _page = 1;
                          });
                          _loadExercises();
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: _FilterDropdown(
                        value: _selectedEquipment,
                        hint: 'All equipment',
                        items: _equipment,
                        onChanged: (value) {
                          setState(() {
                            _selectedEquipment = value ?? '';
                            _page = 1;
                          });
                          _loadExercises();
                        },
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: SmallPillButton(
                        label: 'Search',
                        onTap: _applySearch,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          const SizedBox(height: 18),
          if (!_loadingResults && _error == null)
            Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: BoxDecoration(
                  color: const Color(0xFFEEDFFC),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${_total.toString()} exercises',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF8A42FF),
                  ),
                ),
              ),
            ),
          const SizedBox(height: 18),
          if (_error != null)
            SectionCard(
              child: ErrorBlock(
                message: _error!,
                onRetry: _loadInitial,
              ),
            )
          else if (_loadingResults)
            const SectionCard(child: LoadingBlock())
          else if (_exercises.isEmpty)
            const SectionCard(
              child: EmptyStateText('No exercises found.'),
            )
          else
            Column(
              children: _exercises
                  .map(
                    (exercise) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: ExerciseRow(
                        exercise: exercise,
                        onTap: () => showExerciseDetailsSheet(context, exercise),
                      ),
                    ),
                  )
                  .toList(),
            ),
          const SizedBox(height: 12),
          if (!_loadingResults && _pages > 1)
            Row(
              children: [
                Expanded(
                  child: SmallPillButton(
                    label: 'Prev',
                    onTap: _page <= 1
                        ? () {}
                        : () {
                            setState(() {
                              _page -= 1;
                            });
                            _loadExercises();
                          },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Center(
                    child: Text(
                      '$_page / $_pages',
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF6F6A7C),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: SmallPillButton(
                    label: 'Next',
                    onTap: _page >= _pages
                        ? () {}
                        : () {
                            setState(() {
                              _page += 1;
                            });
                            _loadExercises();
                          },
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }
}

class _FilterDropdown extends StatelessWidget {
  final String value;
  final String hint;
  final List<String> items;
  final ValueChanged<String?> onChanged;

  const _FilterDropdown({
    required this.value,
    required this.hint,
    required this.items,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return DropdownButtonFormField<String>(
      initialValue: value.isEmpty ? null : value,
      items: items
          .map(
            (item) => DropdownMenuItem<String>(
              value: item,
              child: Text(titleCase(item)),
            ),
          )
          .toList(),
      onChanged: onChanged,
      decoration: appTextFieldDecoration(context, hint),
      hint: Text(hint),
    );
  }
}
