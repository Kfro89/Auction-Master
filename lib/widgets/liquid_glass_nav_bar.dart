import 'dart:ui';
import 'package:flutter/material.dart';

class LiquidNavBarItem {
  final IconData icon;
  final String semanticLabel;

  const LiquidNavBarItem({
    required this.icon,
    required this.semanticLabel,
  });
}

class LiquidGlassNavBar extends StatelessWidget {
  final int selectedIndex;
  final ValueChanged<int> onItemSelected;
  final List<LiquidNavBarItem> items;

  const LiquidGlassNavBar({
    Key? key,
    required this.selectedIndex,
    required this.onItemSelected,
    required this.items,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isLight = Theme.of(context).brightness == Brightness.light;

    return Container(
      margin: const EdgeInsets.only(bottom: 24.0, left: 16.0, right: 16.0),
      height: 70.0,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(40.0),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 30,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(40.0),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 25.0, sigmaY: 25.0),
          child: Container(
            decoration: BoxDecoration(
              color: isLight
                  ? const Color(0xFFFFFFFF).withOpacity(0.15)
                  : const Color(0xFF000000).withOpacity(0.25),
              borderRadius: BorderRadius.circular(40.0),
              border: Border.all(
                color: const Color(0xFFFFFFFF).withOpacity(0.2),
                width: 1.0,
              ),
            ),
            child: LayoutBuilder(
              builder: (context, constraints) {
                final itemWidth = constraints.maxWidth / items.length;

                return Stack(
                  children: [
                    // Sliding Pebble
                    AnimatedPositioned(
                      duration: const Duration(milliseconds: 350),
                      curve: Curves.easeOutExpo,
                      left: selectedIndex * itemWidth,
                      top: 0,
                      bottom: 0,
                      width: itemWidth,
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 10.0),
                        child: Container(
                          decoration: BoxDecoration(
                            color: isLight
                                ? const Color(0xFFFFFFFF).withOpacity(0.4)
                                : const Color(0xFFFFFFFF).withOpacity(0.15),
                            borderRadius: BorderRadius.circular(30.0),
                            border: Border.all(
                              color: const Color(0xFFFFFFFF).withOpacity(0.4),
                              width: 1.0,
                            ),
                          ),
                        ),
                      ),
                    ),

                    // Icons
                    Row(
                      children: items.asMap().entries.map((entry) {
                        final index = entry.key;
                        final item = entry.value;
                        final isSelected = index == selectedIndex;

                        return Expanded(
                          child: GestureDetector(
                            behavior: HitTestBehavior.opaque,
                            onTap: () => onItemSelected(index),
                            child: Semantics(
                              label: item.semanticLabel,
                              selected: isSelected,
                              child: Center(
                                child: Icon(
                                  item.icon,
                                  color: isLight
                                      ? (isSelected ? Colors.black87 : Colors.black54)
                                      : (isSelected ? Colors.white : Colors.white70),
                                ),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                );
              },
            ),
          ),
        ),
      ),
    );
  }
}
