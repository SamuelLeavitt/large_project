import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_client/services/workout_service.dart';

void main() {
  group('WorkoutSessionModel', () {
    test('parses session json', () {
      final session = WorkoutSessionModel.fromJson({
        '_id': 'session1',
        'workoutName': 'Push Day',
        'sourceType': 'quickStart',
        'templateId': '',
        'templateName': '',
        'completedAt': '2026-04-14T12:00:00.000Z',
        'durationSeconds': 1200,
        'exercises': [
          {
            'exerciseId': 'bench1',
            'name': 'Bench Press',
            'sets': [
              {'weight': 135, 'reps': 8}
            ]
          }
        ]
      });

      expect(session.id, 'session1');
      expect(session.workoutName, 'Push Day');
      expect(session.exercises.length, 1);
      expect(session.exercises.first.sets.first.weight, 135);
    });
  });

  group('ExerciseResultsPage', () {
    test('parses exercise results json', () {
      final page = ExerciseResultsPage.fromJson({
        'items': [
          {
            '_id': 'ex1',
            'name': 'Squat',
            'category': 'strength',
            'equipment': 'barbell',
            'level': 'beginner',
            'force': 'push',
            'mechanic': 'compound',
            'primaryMuscles': ['quadriceps'],
            'secondaryMuscles': ['glutes'],
            'instructions': ['Stand tall', 'Squat down']
          }
        ],
        'pagination': {
          'total': 1,
          'page': 1,
          'pages': 1,
          'limit': 20,
        }
      });

      expect(page.items.length, 1);
      expect(page.items.first.name, 'Squat');
      expect(page.total, 1);
    });
  });
}
