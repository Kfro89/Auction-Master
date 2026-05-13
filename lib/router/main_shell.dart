import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter/services.dart';
import '../widgets/liquid_glass_nav_bar.dart';

class MainShell extends StatelessWidget {
  final StatefulNavigationShell navigationShell;

  const MainShell({Key? key, required this.navigationShell}) : super(key: key);

  void _goBranch(int index) {
    HapticFeedback.lightImpact();
    navigationShell.goBranch(
      index,
      initialLocation: index == navigationShell.currentIndex,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true, // Allows body to flow underneath the transparent nav bar
      body: navigationShell,
      bottomNavigationBar: SafeArea(
        child: LiquidGlassNavBar(
          selectedIndex: navigationShell.currentIndex,
          onItemSelected: _goBranch,
          items: const [
            LiquidNavBarItem(
              icon: Icons.search,
              semanticLabel: 'Research',
            ),
            LiquidNavBarItem(
              icon: Icons.directions_car,
              semanticLabel: 'Cars',
            ),
            LiquidNavBarItem(
              icon: Icons.favorite_border,
              semanticLabel: 'Watchlist',
            ),
            LiquidNavBarItem(
              icon: Icons.gavel,
              semanticLabel: 'Bids',
            ),
            LiquidNavBarItem(
              icon: Icons.assignment,
              semanticLabel: 'Work Queue',
            ),
            LiquidNavBarItem(
              icon: Icons.storefront,
              semanticLabel: 'Store',
            ),
          ],
        ),
      ),
    );
  }
}
