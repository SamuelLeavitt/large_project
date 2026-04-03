import 'package:flutter/material.dart';

class WorkoutItem {
  final int id;
  final String label;
  final String image;
  final String duration;
  final String link;

  const WorkoutItem({
    required this.id,
    required this.label,
    required this.image,
    required this.duration,
    required this.link,
  });
}

const List<WorkoutItem> recentWorkouts = [
  WorkoutItem(id: 1, label: "Yoga", image: "https://picsum.photos/seed/yoga/300/200", duration: "20 min", link: "/workout/1"),
  WorkoutItem(id: 2, label: "Bench Press", image: "https://picsum.photos/seed/Chest/300/200", duration: "45 min", link: "/workout/2"),
  WorkoutItem(id: 3, label: "Jog", image: "https://picsum.photos/seed/Jogging/300/200", duration: "30 min", link: "/workout/3"),
  WorkoutItem(id: 4, label: "Planks", image: "https://picsum.photos/seed/planks/300/200", duration: "15 min", link: "/workout/4"),
  WorkoutItem(id: 5, label: "Swimming Laps", image: "https://picsum.photos/seed/swim/300/200", duration: "40 min", link: "/workout/5"),
  WorkoutItem(id: 6, label: "Cycling", image: "https://picsum.photos/seed/Cycling/300/200", duration: "60 min", link: "/workout/6"),
  WorkoutItem(id: 7, label: "Bicep Curls", image: "https://picsum.photos/seed/Curls/300/200", duration: "25 min", link: "/workout/7"),
  WorkoutItem(id: 8, label: "Squats", image: "https://picsum.photos/seed/squats/300/200", duration: "10 min", link: "/workout/8"),
  WorkoutItem(id: 9, label: "Deadlifts", image: "https://picsum.photos/seed/power/300/200", duration: "60 min", link: "/workout/9"),
  WorkoutItem(id: 10, label: "Elliptical", image: "https://picsum.photos/seed/elliptical/300/200", duration: "30 min", link: "/workout/10"),
];

const List<WorkoutItem> workoutPlans = [
  WorkoutItem(id: 1, label: "New Workout Plan", image: "https://picsum.photos/seed/workout/300/200", duration: "60 minutes", link: "/workout/1"),
  WorkoutItem(id: 2, label: "Old Workout Plan", image: "https://picsum.photos/seed/workout/300/200", duration: "45 min", link: "/workout/2"),
  WorkoutItem(id: 3, label: "Workout Plan 3", image: "https://picsum.photos/seed/workout/300/200", duration: "30 min", link: "/workout/3"),
  WorkoutItem(id: 4, label: "Group Workout", image: "https://picsum.photos/seed/workout/300/200", duration: "2 hrs", link: "/workout/4"),
  WorkoutItem(id: 5, label: "When Frank tags along", image: "https://picsum.photos/seed/workout/300/200", duration: "1 hr", link: "/workout/5"),
  WorkoutItem(id: 6, label: "Summer Workout Plan", image: "https://picsum.photos/seed/workout/300/200", duration: "60 min", link: "/workout/6"),
  WorkoutItem(id: 7, label: "Winter Workout Plan", image: "https://picsum.photos/seed/workout/300/200", duration: "25 min", link: "/workout/7"),
  WorkoutItem(id: 8, label: "One Punch Man", image: "https://picsum.photos/seed/workout/300/200", duration: "100 min", link: "/workout/8"),
  WorkoutItem(id: 9, label: "Rocky Balboa Workout", image: "https://picsum.photos/seed/workout/300/200", duration: "60 min", link: "/workout/9"),
  WorkoutItem(id: 10, label: "Idk", image: "https://picsum.photos/seed/workout/300/200", duration: "Infinity", link: "/workout/10"),
];

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        title: const Text(
          'Workout App',
          style: TextStyle(
            color: Colors.black,
            fontWeight: FontWeight.w600,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pushReplacementNamed(context, '/login');
            },
            child: const Text(
              'Logout',
              style: TextStyle(
                color: Color(0xFF007BFF),
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.only(top: 20, bottom: 24),
        children: const [
          WorkoutScrollRow(
            title: 'Recent Workouts',
            items: recentWorkouts,
          ),
          SizedBox(height: 10),
          WorkoutScrollRow(
            title: 'My Workout Plans',
            items: workoutPlans,
          ),
        ],
      ),
    );
  }
}

class WorkoutScrollRow extends StatelessWidget {
  final String title;
  final List<WorkoutItem> items;

  const WorkoutScrollRow({
    super.key,
    required this.title,
    required this.items,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            title,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w700,
              color: Colors.black,
            ),
          ),
        ),
        const SizedBox(height: 14),
        SizedBox(
          height: 220,
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            scrollDirection: Axis.horizontal,
            itemCount: items.length,
            separatorBuilder: (_, __) => const SizedBox(width: 14),
            itemBuilder: (context, index) {
              return WorkoutCard(item: items[index]);
            },
          ),
        ),
      ],
    );
  }
}

class WorkoutCard extends StatelessWidget {
  final WorkoutItem item;

  const WorkoutCard({
    super.key,
    required this.item,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(12),
      onTap: () {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Open ${item.label} (${item.link})')),
        );
      },
      child: SizedBox(
        width: 210,
        child: Card(
          elevation: 1.5,
          color: Colors.white,
          surfaceTintColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: const BorderSide(color: Color(0xFFE7E7E7)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(12),
                ),
                child: Image.network(
                  item.image,
                  height: 120,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) {
                    return Container(
                      height: 120,
                      width: double.infinity,
                      color: const Color(0xFFF1F1F1),
                      alignment: Alignment.center,
                      child: const Icon(Icons.image_not_supported_outlined),
                    );
                  },
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(12, 12, 12, 6),
                child: Text(
                  item.label,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: Colors.black,
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: Text(
                  item.duration,
                  style: const TextStyle(
                    fontSize: 14,
                    color: Color(0xFF666666),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
