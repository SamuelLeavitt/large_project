import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_client/services/auth_service.dart';

void main() {
  group('CurrentUser', () {
    test('parses current user json', () {
      final user = CurrentUser.fromJson({
        'id': 'abc123',
        'username': 'tester',
        'email': 'tester@example.com',
        'themePreference': 'dark',
      });

      expect(user.id, 'abc123');
      expect(user.username, 'tester');
      expect(user.email, 'tester@example.com');
      expect(user.themePreference, 'dark');
    });
  });

  group('SessionExpiredException', () {
    test('has friendly message', () {
      const error = SessionExpiredException();
      expect(error.toString(), contains('session expired'));
    });
  });
}
