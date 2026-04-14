import 'dart:convert';

import 'package:http/http.dart' as http;

import 'auth_service.dart';

class ExerciseFilters {
  final List<String> categories;
  final List<String> equipment;
  final List<String> levels;
  final List<String> primaryMuscles;

  const ExerciseFilters({
    required this.categories,
    required this.equipment,
    required this.levels,
    required this.primaryMuscles,
  });

  factory ExerciseFilters.fromJson(Map<String, dynamic> json) {
    List<String> toStringList(dynamic value) {
      if (value is List) {
        return value.map((e) => e.toString()).where((e) => e.isNotEmpty).toList();
      }
      return [];
    }

    return ExerciseFilters(
      categories: toStringList(json['categories']),
      equipment: toStringList(json['equipment']),
      levels: toStringList(json['levels']),
      primaryMuscles: toStringList(json['primaryMuscles']),
    );
  }
}

class ExerciseModel {
  final String id;
  final String name;
  final String category;
  final String equipment;
  final String level;
  final String force;
  final String mechanic;
  final List<String> primaryMuscles;
  final List<String> secondaryMuscles;
  final List<String> instructions;

  const ExerciseModel({
    required this.id,
    required this.name,
    required this.category,
    required this.equipment,
    required this.level,
    required this.force,
    required this.mechanic,
    required this.primaryMuscles,
    required this.secondaryMuscles,
    required this.instructions,
  });

  factory ExerciseModel.fromJson(Map<String, dynamic> json) {
    List<String> toStringList(dynamic value) {
      if (value is List) {
        return value.map((e) => e.toString()).toList();
      }
      return [];
    }

    return ExerciseModel(
      id: (json['_id'] ?? json['id'] ?? json['datasetId'] ?? json['name'] ?? '')
          .toString(),
      name: (json['name'] ?? '').toString(),
      category: (json['category'] ?? '').toString(),
      equipment: (json['equipment'] ?? '').toString(),
      level: (json['level'] ?? '').toString(),
      force: (json['force'] ?? '').toString(),
      mechanic: (json['mechanic'] ?? '').toString(),
      primaryMuscles: toStringList(json['primaryMuscles']),
      secondaryMuscles: toStringList(json['secondaryMuscles']),
      instructions: toStringList(json['instructions']),
    );
  }
}

class ExerciseResultsPage {
  final List<ExerciseModel> items;
  final int total;
  final int page;
  final int pages;
  final int limit;

  const ExerciseResultsPage({
    required this.items,
    required this.total,
    required this.page,
    required this.pages,
    required this.limit,
  });

  factory ExerciseResultsPage.fromJson(Map<String, dynamic> json) {
    final rawItems = json['items'];
    final rawPagination = json['pagination'];

    final items = rawItems is List
        ? rawItems
            .whereType<Map<String, dynamic>>()
            .map(ExerciseModel.fromJson)
            .toList()
        : <ExerciseModel>[];

    final pagination =
        rawPagination is Map<String, dynamic> ? rawPagination : <String, dynamic>{};

    return ExerciseResultsPage(
      items: items,
      total: ((pagination['total'] ?? 0) as num?)?.toInt() ?? 0,
      page: ((pagination['page'] ?? 1) as num?)?.toInt() ?? 1,
      pages: ((pagination['pages'] ?? 1) as num?)?.toInt() ?? 1,
      limit: ((pagination['limit'] ?? 20) as num?)?.toInt() ?? 20,
    );
  }
}

class WorkoutTemplateExercise {
  final String exerciseId;
  final String name;
  final String category;
  final String bodyPart;
  final int sets;
  final String reps;

  const WorkoutTemplateExercise({
    required this.exerciseId,
    required this.name,
    required this.category,
    required this.bodyPart,
    required this.sets,
    required this.reps,
  });

  WorkoutTemplateExercise copyWith({
    String? exerciseId,
    String? name,
    String? category,
    String? bodyPart,
    int? sets,
    String? reps,
  }) {
    return WorkoutTemplateExercise(
      exerciseId: exerciseId ?? this.exerciseId,
      name: name ?? this.name,
      category: category ?? this.category,
      bodyPart: bodyPart ?? this.bodyPart,
      sets: sets ?? this.sets,
      reps: reps ?? this.reps,
    );
  }

  factory WorkoutTemplateExercise.fromJson(Map<String, dynamic> json) {
    return WorkoutTemplateExercise(
      exerciseId: (json['exerciseId'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      category: (json['category'] ?? '').toString(),
      bodyPart: (json['bodyPart'] ?? '').toString(),
      sets: ((json['sets'] ?? 0) as num?)?.toInt() ?? 0,
      reps: (json['reps'] ?? '0').toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'exerciseId': exerciseId,
      'name': name,
      'category': category,
      'bodyPart': bodyPart,
      'sets': sets,
      'reps': reps,
    };
  }
}

class WorkoutTemplateSummary {
  final String id;
  final String name;
  final String bodyPart;
  final String createdAt;
  final List<WorkoutTemplateExercise> exercises;

  const WorkoutTemplateSummary({
    required this.id,
    required this.name,
    required this.bodyPart,
    required this.createdAt,
    required this.exercises,
  });

  int get exerciseCount => exercises.length;

  factory WorkoutTemplateSummary.fromJson(Map<String, dynamic> json) {
    final rawExercises = json['exercises'];
    final exercises = rawExercises is List
        ? rawExercises
            .whereType<Map<String, dynamic>>()
            .map(WorkoutTemplateExercise.fromJson)
            .toList()
        : <WorkoutTemplateExercise>[];

    return WorkoutTemplateSummary(
      id: (json['id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      bodyPart: (json['bodyPart'] ?? 'Custom').toString(),
      createdAt: (json['createdAt'] ?? '').toString(),
      exercises: exercises,
    );
  }
}

class LoggedSetDraft {
  final int weight;
  final int reps;

  const LoggedSetDraft({
    required this.weight,
    required this.reps,
  });

  LoggedSetDraft copyWith({
    int? weight,
    int? reps,
  }) {
    return LoggedSetDraft(
      weight: weight ?? this.weight,
      reps: reps ?? this.reps,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'weight': weight,
      'reps': reps,
    };
  }
}

class ActiveWorkoutExercise {
  final String exerciseId;
  final String name;
  final List<LoggedSetDraft> sets;

  const ActiveWorkoutExercise({
    required this.exerciseId,
    required this.name,
    required this.sets,
  });

  Map<String, dynamic> toJson() {
    return {
      'exerciseId': exerciseId,
      'name': name,
      'sets': sets.map((s) => s.toJson()).toList(),
    };
  }
}

class WorkoutSessionSet {
  final int weight;
  final int reps;

  const WorkoutSessionSet({
    required this.weight,
    required this.reps,
  });

  factory WorkoutSessionSet.fromJson(Map<String, dynamic> json) {
    return WorkoutSessionSet(
      weight: ((json['weight'] ?? 0) as num?)?.toInt() ?? 0,
      reps: ((json['reps'] ?? 0) as num?)?.toInt() ?? 0,
    );
  }
}

class WorkoutSessionExercise {
  final String exerciseId;
  final String name;
  final List<WorkoutSessionSet> sets;

  const WorkoutSessionExercise({
    required this.exerciseId,
    required this.name,
    required this.sets,
  });

  factory WorkoutSessionExercise.fromJson(Map<String, dynamic> json) {
    final rawSets = json['sets'];
    return WorkoutSessionExercise(
      exerciseId: (json['exerciseId'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      sets: rawSets is List
          ? rawSets
              .whereType<Map<String, dynamic>>()
              .map(WorkoutSessionSet.fromJson)
              .toList()
          : <WorkoutSessionSet>[],
    );
  }
}

class WorkoutSessionModel {
  final String id;
  final String workoutName;
  final String sourceType;
  final String templateId;
  final String templateName;
  final DateTime completedAt;
  final int durationSeconds;
  final List<WorkoutSessionExercise> exercises;

  const WorkoutSessionModel({
    required this.id,
    required this.workoutName,
    required this.sourceType,
    required this.templateId,
    required this.templateName,
    required this.completedAt,
    required this.durationSeconds,
    required this.exercises,
  });

  factory WorkoutSessionModel.fromJson(Map<String, dynamic> json) {
    final rawExercises = json['exercises'];

    return WorkoutSessionModel(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      workoutName: (json['workoutName'] ?? '').toString(),
      sourceType: (json['sourceType'] ?? 'quickStart').toString(),
      templateId: (json['templateId'] ?? '').toString(),
      templateName: (json['templateName'] ?? '').toString(),
      completedAt:
          DateTime.tryParse((json['completedAt'] ?? '').toString()) ?? DateTime.now(),
      durationSeconds: ((json['durationSeconds'] ?? 0) as num?)?.toInt() ?? 0,
      exercises: rawExercises is List
          ? rawExercises
              .whereType<Map<String, dynamic>>()
              .map(WorkoutSessionExercise.fromJson)
              .toList()
          : <WorkoutSessionExercise>[],
    );
  }
}

class WorkoutService {
  static const String _workoutsBase = 'https://s2a0m2u6.xyz/api/workouts';
  static const String _exercisesBase = 'https://s2a0m2u6.xyz/api/exercises';

  static Map<String, String> _jsonHeaders({bool auth = false}) {
    final headers = <String, String>{
      'Content-Type': 'application/json',
    };

    if (auth) {
      final token = AuthService.token;
      if (token == null || token.isEmpty) {
        throw Exception('You are not logged in.');
      }
      headers['Authorization'] = 'Bearer $token';
    }

    return headers;
  }

  static Map<String, dynamic> _decodeObject(http.Response res) {
    try {
      return jsonDecode(res.body) as Map<String, dynamic>;
    } catch (_) {
      throw Exception(
        'Server returned non-JSON response (status ${res.statusCode}).',
      );
    }
  }

  static Future<List<WorkoutTemplateSummary>> fetchTemplates() async {
    final res = await http.get(
      Uri.parse('$_workoutsBase/templates'),
      headers: _jsonHeaders(auth: true),
    );

    final data = _decodeObject(res);

    if (res.statusCode != 200) {
      throw Exception(
        data['error'] ?? data['message'] ?? 'Failed to load workout templates.',
      );
    }

    final items = data['items'];
    if (items is! List) return [];

    return items
        .whereType<Map<String, dynamic>>()
        .map(WorkoutTemplateSummary.fromJson)
        .toList();
  }

  static Future<List<WorkoutSessionModel>> fetchSessions() async {
    final res = await http.get(
      Uri.parse('$_workoutsBase/sessions'),
      headers: _jsonHeaders(auth: true),
    );

    final data = _decodeObject(res);

    if (res.statusCode != 200) {
      throw Exception(
        data['error'] ?? data['message'] ?? 'Failed to load workout sessions.',
      );
    }

    final items = data['items'];
    if (items is! List) return [];

    return items
        .whereType<Map<String, dynamic>>()
        .map(WorkoutSessionModel.fromJson)
        .toList();
  }

  static Future<WorkoutTemplateSummary> createTemplate({
    required String name,
    required String bodyPart,
    required List<WorkoutTemplateExercise> exercises,
  }) async {
    final res = await http.post(
      Uri.parse('$_workoutsBase/templates'),
      headers: _jsonHeaders(auth: true),
      body: jsonEncode({
        'name': name,
        'bodyPart': bodyPart,
        'exercises': exercises.map((e) => e.toJson()).toList(),
      }),
    );

    final data = _decodeObject(res);

    if (res.statusCode != 200 && res.statusCode != 201) {
      throw Exception(
        data['error'] ?? data['message'] ?? 'Failed to create workout template.',
      );
    }

    return WorkoutTemplateSummary.fromJson(
      (data['item'] as Map<String, dynamic>?) ?? <String, dynamic>{},
    );
  }

  static Future<WorkoutTemplateSummary> updateTemplate({
    required String id,
    required String name,
    required String bodyPart,
    required List<WorkoutTemplateExercise> exercises,
  }) async {
    final res = await http.put(
      Uri.parse('$_workoutsBase/templates/$id'),
      headers: _jsonHeaders(auth: true),
      body: jsonEncode({
        'name': name,
        'bodyPart': bodyPart,
        'exercises': exercises.map((e) => e.toJson()).toList(),
      }),
    );

    final data = _decodeObject(res);

    if (res.statusCode != 200) {
      throw Exception(
        data['error'] ?? data['message'] ?? 'Failed to update workout template.',
      );
    }

    return WorkoutTemplateSummary.fromJson(
      (data['item'] as Map<String, dynamic>?) ?? <String, dynamic>{},
    );
  }

  static Future<void> deleteTemplate(String id) async {
    final res = await http.delete(
      Uri.parse('$_workoutsBase/templates/$id'),
      headers: _jsonHeaders(auth: true),
    );

    Map<String, dynamic> data = {};
    try {
      data = jsonDecode(res.body) as Map<String, dynamic>;
    } catch (_) {}

    if (res.statusCode != 200 && res.statusCode != 204 && res.statusCode != 404) {
      throw Exception(
        data['error'] ?? data['message'] ?? 'Failed to delete workout template.',
      );
    }
  }

  static Future<void> saveQuickStartSession({
    required String workoutName,
    required int durationSeconds,
    required List<ActiveWorkoutExercise> exercises,
    String? templateId,
    String? templateName,
    String sourceType = 'quickStart',
  }) async {
    final res = await http.post(
      Uri.parse('$_workoutsBase/sessions'),
      headers: _jsonHeaders(auth: true),
      body: jsonEncode({
        'workoutName': workoutName,
        'sourceType': sourceType,
        'templateId': templateId,
        'templateName': templateName ?? '',
        'durationSeconds': durationSeconds,
        'completedAt': DateTime.now().toIso8601String(),
        'exercises': exercises.map((e) => e.toJson()).toList(),
      }),
    );

    final data = _decodeObject(res);

    if (res.statusCode != 200 && res.statusCode != 201) {
      throw Exception(
        data['error'] ?? data['message'] ?? 'Failed to save workout.',
      );
    }
  }

  static Future<ExerciseFilters> fetchExerciseFilters() async {
    final res = await http.get(
      Uri.parse('$_exercisesBase/meta/filters'),
      headers: _jsonHeaders(),
    );

    final data = _decodeObject(res);

    if (res.statusCode != 200) {
      throw Exception(
        data['error'] ?? data['message'] ?? 'Failed to load exercise filters.',
      );
    }

    return ExerciseFilters.fromJson(data);
  }

  static Future<ExerciseResultsPage> fetchExercises({
    String search = '',
    String category = '',
    String equipment = '',
    String level = '',
    String muscle = '',
    int page = 1,
    int limit = 20,
  }) async {
    final params = <String, String>{
      'page': '$page',
      'limit': '$limit',
    };

    if (search.trim().isNotEmpty) params['search'] = search.trim();
    if (category.trim().isNotEmpty) params['category'] = category.trim();
    if (equipment.trim().isNotEmpty) params['equipment'] = equipment.trim();
    if (level.trim().isNotEmpty) params['level'] = level.trim();
    if (muscle.trim().isNotEmpty) params['muscle'] = muscle.trim();

    final uri = Uri.parse(_exercisesBase).replace(queryParameters: params);

    final res = await http.get(
      uri,
      headers: _jsonHeaders(),
    );

    final data = _decodeObject(res);

    if (res.statusCode != 200) {
      throw Exception(
        data['error'] ?? data['message'] ?? 'Failed to load exercises.',
      );
    }

    return ExerciseResultsPage.fromJson(data);
  }
}
