import 'package:flutter/material.dart';

class AppTheme {
  static const Color primaryBackground = Color(0xFFFAFAFA);
  static const Color primaryBlue = Color(0xFF2563EB);
  static const Color slate = Color(0xFF0F172A);
  static const Color successEmerald = Color(0xFF10B981);
  static const Color warningAmber = Color(0xFFF59E0B);
  
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: primaryBackground,
      colorScheme: const ColorScheme.light(
        primary: primaryBlue,
        secondary: slate,
        surface: Colors.white,
        error: warningAmber,
      ),
      fontFamily: 'Inter',
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        iconTheme: IconThemeData(color: slate),
        titleTextStyle: TextStyle(
          color: slate,
          fontSize: 20,
          fontWeight: FontWeight.w600,
          fontFamily: 'Inter',
        ),
      ),
      cardTheme: CardThemeData(
        color: Colors.white.withValues(alpha: 0.65),
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: Colors.black.withValues(alpha: 0.05), width: 1),
        ),
      ),
    );
  }
}
