import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../services/auth_service.dart';
import '../../services/workout_service.dart';
import '../../theme/app_styles.dart';
import '../../widgets/app_buttons.dart';
import '../../widgets/app_cards.dart';
import '../../widgets/app_feedback.dart';

class ProfileTab extends StatefulWidget {
  const ProfileTab({super.key});

  @override
  State<ProfileTab> createState() => _ProfileTabState();
}

class _ProfileTabState extends State<ProfileTab> {
  bool _loading = true;
  String? _error;

  CurrentUser? _user;
  List<WorkoutSessionModel> _sessions = [];

  String? _selectedExercise;
  ProfileChartMetric _metric = ProfileChartMetric.maxWeight;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final results = await Future.wait<dynamic>([
        AuthService.fetchCurrentUser(),
        WorkoutService.fetchSessions(),
      ]);

      final user = results[0] as CurrentUser;
      final sessions = results[1] as List<WorkoutSessionModel>;
      final exerciseNames = _extractExerciseNames(sessions);

      if (!mounted) return;
      setState(() {
        _user = user;
        _sessions = sessions;
        _selectedExercise = exerciseNames.isNotEmpty ? exerciseNames.first : null;
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
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  List<String> _extractExerciseNames(List<WorkoutSessionModel> sessions) {
    final names = <String>{};

    for (final session in sessions) {
      for (final exercise in session.exercises) {
        final name = exercise.name.trim();
        if (name.isNotEmpty) {
          names.add(name);
        }
      }
    }

    final sorted = names.toList()
      ..sort((a, b) => a.toLowerCase().compareTo(b.toLowerCase()));
    return sorted;
  }

  Future<void> _logout() async {
    await AuthService.logout();
    if (!mounted) return;
    Navigator.pushNamedAndRemoveUntil(context, '/login', (_) => false);
  }

  List<ProfileChartPoint> _buildChartPoints() {
    if (_selectedExercise == null || _selectedExercise!.trim().isEmpty) {
      return [];
    }

    final selected = _selectedExercise!.trim();
    final points = <ProfileChartPoint>[];

    final chronological = [..._sessions]
      ..sort((a, b) => a.completedAt.compareTo(b.completedAt));

    for (final session in chronological) {
      WorkoutSessionExercise? match;

      for (final exercise in session.exercises) {
        if (exercise.name.trim().toLowerCase() == selected.toLowerCase()) {
          match = exercise;
          break;
        }
      }

      if (match == null) continue;

      final sets = match.sets;
      if (sets.isEmpty) continue;

      final maxWeight =
          sets.fold<int>(0, (maxSoFar, set) => math.max(maxSoFar, set.weight));
      final volume =
          sets.fold<int>(0, (sum, set) => sum + (set.weight * set.reps));

      points.add(
        ProfileChartPoint(
          label: _formatChartDate(session.completedAt),
          value: _metric == ProfileChartMetric.maxWeight
              ? maxWeight.toDouble()
              : volume.toDouble(),
        ),
      );
    }

    return points;
  }

  @override
  Widget build(BuildContext context) {
    final exerciseNames = _extractExerciseNames(_sessions);
    final chartPoints = _buildChartPoints();

    return TabPageScaffold(
      child: RefreshIndicator(
        onRefresh: _loadProfile,
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
          children: [
            const Center(
              child: Text(
                'Profile',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  color: Colors.black,
                ),
              ),
            ),
            const SizedBox(height: 18),
            if (_loading)
              const SectionCard(
                child: LoadingBlock(),
              )
            else if (_error != null)
              SectionCard(
                child: ErrorBlock(
                  message: _error!,
                  onRetry: _loadProfile,
                ),
              )
            else ...[
              _ProfileHeaderCard(
                user: _user!,
                onLogout: _logout,
              ),
              const SizedBox(height: 18),
              SectionCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Center(
                      child: Text(
                        'Track your progress over time',
                        style: TextStyle(
                          fontSize: 16,
                          color: Color(0xFF9A96A4),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    const SizedBox(height: 18),
                    const Center(
                      child: Text(
                        'EXERCISE',
                        style: TextStyle(
                          fontSize: 12,
                          letterSpacing: 1.2,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFFB2AEBB),
                        ),
                      ),
                    ),
                    const SizedBox(height: 14),
                    if (exerciseNames.isEmpty)
                      const EmptyStateText('No workout history yet.')
                    else ...[
                      DropdownButtonFormField<String>(
                        initialValue: _selectedExercise != null &&
                                exerciseNames.contains(_selectedExercise)
                            ? _selectedExercise
                            : exerciseNames.first,
                        items: exerciseNames
                            .map(
                              (name) => DropdownMenuItem<String>(
                                value: name,
                                child: Text(name),
                              ),
                            )
                            .toList(),
                        onChanged: (value) {
                          setState(() {
                            _selectedExercise = value;
                          });
                        },
                        decoration: appTextFieldDecoration(context, 'Choose exercise'),
                      ),
                      const SizedBox(height: 18),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          _MetricToggleButton(
                            label: 'Max Weight',
                            selected: _metric == ProfileChartMetric.maxWeight,
                            onTap: () {
                              setState(() {
                                _metric = ProfileChartMetric.maxWeight;
                              });
                            },
                          ),
                          const SizedBox(width: 10),
                          _MetricToggleButton(
                            label: 'Volume',
                            selected: _metric == ProfileChartMetric.volume,
                            onTap: () {
                              setState(() {
                                _metric = ProfileChartMetric.volume;
                              });
                            },
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),
                      Container(
                        height: 300,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: const Color(0xFFD9D9D9)),
                        ),
                        child: chartPoints.isEmpty
                            ? const Center(
                                child: Text(
                                  'No logged sets for this exercise yet.',
                                  style: TextStyle(
                                    color: Color(0xFF6E6A7C),
                                  ),
                                ),
                              )
                            : ProfileLineChart(
                                points: chartPoints,
                                metric: _metric,
                              ),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 18),
              SectionCard(
                child: _SessionLogList(
                  sessions: _sessions,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _ProfileHeaderCard extends StatelessWidget {
  final CurrentUser user;
  final VoidCallback onLogout;

  const _ProfileHeaderCard({
    required this.user,
    required this.onLogout,
  });

  @override
  Widget build(BuildContext context) {
    return SectionCard(
      child: Column(
        children: [
          Text(
            user.username,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w700,
              color: Colors.black,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            user.email,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 16,
              color: Color(0xFF6E6A7C),
            ),
          ),
          const SizedBox(height: 16),
          PillButton(
            label: 'Logout',
            onTap: onLogout,
          ),
        ],
      ),
    );
  }
}

class _SessionLogList extends StatefulWidget {
  final List<WorkoutSessionModel> sessions;

  const _SessionLogList({
    required this.sessions,
  });

  @override
  State<_SessionLogList> createState() => _SessionLogListState();
}

class _SessionLogListState extends State<_SessionLogList> {
  final Set<String> _expandedSessionIds = {};

  void _toggleSession(String id) {
    setState(() {
      if (_expandedSessionIds.contains(id)) {
        _expandedSessionIds.remove(id);
      } else {
        _expandedSessionIds.add(id);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    if (widget.sessions.isEmpty) {
      return const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Session Log',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
            ),
          ),
          SizedBox(height: 16),
          EmptyStateText('No sessions logged yet.'),
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Session Log',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 16),
        ...widget.sessions.map((session) {
          final isOpen = _expandedSessionIds.contains(session.id);
          final totalSets = session.exercises.fold<int>(
            0,
            (sum, exercise) => sum + exercise.sets.length,
          );
          final exerciseCount = session.exercises.length;

          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Material(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              child: InkWell(
                borderRadius: BorderRadius.circular(18),
                onTap: () => _toggleSession(session.id),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8F8F6),
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: const Color(0xFFD9D9D9)),
                  ),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  _formatLongDate(session.completedAt),
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w700,
                                    color: Color(0xFF666173),
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  _formatTime(session.completedAt),
                                  style: const TextStyle(
                                    fontSize: 14,
                                    color: Color(0xFF9A96A4),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          _SessionPill(
                            text: '$exerciseCount ${exerciseCount == 1 ? 'exercise' : 'exercises'}',
                          ),
                          const SizedBox(width: 8),
                          _SessionPill(
                            text: '$totalSets ${totalSets == 1 ? 'set' : 'sets'}',
                          ),
                          const SizedBox(width: 8),
                          Icon(
                            isOpen
                                ? Icons.expand_less_rounded
                                : Icons.chevron_right_rounded,
                            color: const Color(0xFFC39BFF),
                          ),
                        ],
                      ),
                      if (isOpen) ...[
                        const SizedBox(height: 14),
                        const Divider(height: 1),
                        const SizedBox(height: 14),
                        ...session.exercises.map((exercise) {
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(color: const Color(0xFFE1E1E1)),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    exercise.name,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w700,
                                      fontSize: 15,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  if (exercise.sets.isEmpty)
                                    const Text(
                                      'No sets logged.',
                                      style: TextStyle(color: Color(0xFF6E6A7C)),
                                    )
                                  else
                                    ...List.generate(exercise.sets.length, (index) {
                                      final set = exercise.sets[index];
                                      return Padding(
                                        padding: const EdgeInsets.only(bottom: 6),
                                        child: Text(
                                          'Set ${index + 1}: ${set.weight} lbs × ${set.reps} reps',
                                          style: const TextStyle(
                                            color: Color(0xFF6E6A7C),
                                          ),
                                        ),
                                      );
                                    }),
                                ],
                              ),
                            ),
                          );
                        }),
                      ],
                    ],
                  ),
                ),
              ),
            ),
          );
        }),
      ],
    );
  }
}

class _SessionPill extends StatelessWidget {
  final String text;

  const _SessionPill({
    required this.text,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFFEEDFFC),
        borderRadius: BorderRadius.circular(999),
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

class _MetricToggleButton extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _MetricToggleButton({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: selected ? const Color(0xFFEEDFFC) : Colors.white,
      borderRadius: BorderRadius.circular(999),
      child: InkWell(
        borderRadius: BorderRadius.circular(999),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(999),
            border: Border.all(
              color: selected ? const Color(0xFFA144FF) : const Color(0xFFD4D4D4),
            ),
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: selected ? const Color(0xFFA144FF) : const Color(0xFF6F6A7C),
            ),
          ),
        ),
      ),
    );
  }
}

enum ProfileChartMetric {
  maxWeight,
  volume,
}

class ProfileChartPoint {
  final String label;
  final double value;

  const ProfileChartPoint({
    required this.label,
    required this.value,
  });
}

class ProfileLineChart extends StatelessWidget {
  final List<ProfileChartPoint> points;
  final ProfileChartMetric metric;

  const ProfileLineChart({
    super.key,
    required this.points,
    required this.metric,
  });

  @override
  Widget build(BuildContext context) {
    final maxValue =
        points.fold<double>(0, (maxSoFar, point) => math.max(maxSoFar, point.value));
    final paddedMax = maxValue <= 0 ? 1.0 : maxValue * 1.2;

    return Column(
      children: [
        Expanded(
          child: CustomPaint(
            painter: _ProfileChartPainter(
              points: points,
              maxValue: paddedMax,
            ),
            child: const SizedBox.expand(),
          ),
        ),
        const SizedBox(height: 10),
        Text(
          metric == ProfileChartMetric.maxWeight ? 'Max Weight' : 'Volume',
          style: const TextStyle(
            color: Color(0xFF6E6A7C),
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}

class _ProfileChartPainter extends CustomPainter {
  final List<ProfileChartPoint> points;
  final double maxValue;

  _ProfileChartPainter({
    required this.points,
    required this.maxValue,
  });

  @override
  void paint(Canvas canvas, Size size) {
    const leftPad = 28.0;
    const rightPad = 10.0;
    const topPad = 12.0;
    const bottomPad = 26.0;

    final chartWidth = size.width - leftPad - rightPad;
    final chartHeight = size.height - topPad - bottomPad;

    final gridPaint = Paint()
      ..color = const Color(0xFFE3E3E3)
      ..strokeWidth = 1;

    final axisPaint = Paint()
      ..color = const Color(0xFFD0D0D0)
      ..strokeWidth = 1.2;

    final linePaint = Paint()
      ..color = const Color(0xFFA144FF)
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke;

    final pointPaint = Paint()
      ..color = const Color(0xFFA144FF)
      ..style = PaintingStyle.fill;

    final labelStyle = const TextStyle(
      color: Color(0xFF9A96A4),
      fontSize: 11,
    );

    for (var i = 0; i < 4; i++) {
      final y = topPad + (chartHeight / 3) * i;
      canvas.drawLine(
        Offset(leftPad, y),
        Offset(leftPad + chartWidth, y),
        gridPaint,
      );
    }

    final verticalDivisions = math.max(points.length - 1, 1);
    for (var i = 0; i <= verticalDivisions; i++) {
      final x = leftPad + (chartWidth / verticalDivisions) * i;
      canvas.drawLine(
        Offset(x, topPad),
        Offset(x, topPad + chartHeight),
        gridPaint,
      );
    }

    canvas.drawLine(
      Offset(leftPad, topPad + chartHeight),
      Offset(leftPad + chartWidth, topPad + chartHeight),
      axisPaint,
    );

    canvas.drawLine(
      Offset(leftPad, topPad),
      Offset(leftPad, topPad + chartHeight),
      axisPaint,
    );

    final path = Path();
    for (var i = 0; i < points.length; i++) {
      final x = leftPad + (chartWidth / math.max(points.length - 1, 1)) * i;
      final y = topPad + chartHeight - ((points[i].value / maxValue) * chartHeight);

      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }

    if (points.length > 1) {
      canvas.drawPath(path, linePaint);
    }

    for (var i = 0; i < points.length; i++) {
      final x = leftPad + (chartWidth / math.max(points.length - 1, 1)) * i;
      final y = topPad + chartHeight - ((points[i].value / maxValue) * chartHeight);

      canvas.drawCircle(Offset(x, y), 4.5, pointPaint);

      final textPainter = TextPainter(
        text: TextSpan(
          text: points[i].label,
          style: labelStyle,
        ),
        textDirection: TextDirection.ltr,
        maxLines: 1,
      )..layout(maxWidth: 50);

      textPainter.paint(
        canvas,
        Offset(x - (textPainter.width / 2), topPad + chartHeight + 6),
      );
    }

    final tickValues = [
      maxValue,
      maxValue * 0.66,
      maxValue * 0.33,
      0.0,
    ];

    for (var i = 0; i < tickValues.length; i++) {
      final y = topPad + (chartHeight / 3) * i;
      final tickText = tickValues[i].round().toString();

      final textPainter = TextPainter(
        text: TextSpan(
          text: tickText,
          style: labelStyle,
        ),
        textDirection: TextDirection.ltr,
      )..layout();

      textPainter.paint(
        canvas,
        Offset(leftPad - textPainter.width - 6, y - (textPainter.height / 2)),
      );
    }
  }

  @override
  bool shouldRepaint(covariant _ProfileChartPainter oldDelegate) {
    return oldDelegate.points != points || oldDelegate.maxValue != maxValue;
  }
}

String _formatChartDate(DateTime date) {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return '${months[date.month - 1]} ${date.day}';
}

String _formatLongDate(DateTime date) {
  const weekdays = [
    'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
  ];
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return '${weekdays[date.weekday - 1]}, ${months[date.month - 1]} ${date.day}, ${date.year}';
}

String _formatTime(DateTime date) {
  final hour = date.hour == 0 ? 12 : (date.hour > 12 ? date.hour - 12 : date.hour);
  final minute = date.minute.toString().padLeft(2, '0');
  final suffix = date.hour >= 12 ? 'PM' : 'AM';
  return '$hour:$minute $suffix';
}
