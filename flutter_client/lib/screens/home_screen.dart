import 'package:flutter/material.dart';

import '../services/auth_service.dart';
import '../widgets/app_header.dart';
import 'tabs/profile_tab.dart';
import 'tabs/search_exercises_tab.dart';
import 'tabs/workout_home_tab.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 1;

  late final List<Widget> _pages = const [
    SearchExercisesTab(),
    WorkoutHomeTab(),
    ProfileTab(),
  ];

  void handleSessionExpired(BuildContext context, Object error) {
    if (error is SessionExpiredException) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        Navigator.pushNamedAndRemoveUntil(context, '/login', (_) => false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Your session expired. Please log in again.'),
          ),
        );
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF6F6F6),
      body: Column(
        children: [
          const AppHeader(title: 'PixelFit'),
          Expanded(
            child: IndexedStack(
              index: _currentIndex,
              children: _pages,
            ),
          ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        top: false,
        child: NavigationBar(
          selectedIndex: _currentIndex,
          backgroundColor: const Color(0xFFEDEFEA),
          indicatorColor: const Color(0xFFD9DDD5),
          labelBehavior: NavigationDestinationLabelBehavior.alwaysHide,
          height: 72,
          onDestinationSelected: (index) {
            setState(() {
              _currentIndex = index;
            });
          },
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.search_outlined),
              selectedIcon: Icon(Icons.search),
              label: 'Search',
            ),
            NavigationDestination(
              icon: Icon(Icons.home_outlined),
              selectedIcon: Icon(Icons.home),
              label: 'Home',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_outline),
              selectedIcon: Icon(Icons.person),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }
}
