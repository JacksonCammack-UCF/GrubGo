import 'package:flutter/material.dart';

class AppTheme {
  static ThemeData lightTheme = ThemeData(
    brightness: Brightness.light,
    primaryColor: const Color(0xFF6C4DFF),
    scaffoldBackgroundColor: Colors.white,
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.white,
      elevation: 2,
      shadowColor: Colors.black12,
      titleTextStyle: TextStyle(
        color: Colors.black,
        fontWeight: FontWeight.bold,
        fontSize: 22,
      ),
      iconTheme: IconThemeData(color: Colors.black),
    ),
    inputDecorationTheme: const InputDecorationTheme(
      border: UnderlineInputBorder(),
      focusedBorder: UnderlineInputBorder(
        borderSide: BorderSide(color: Color(0xFF6C4DFF), width: 2),
      ),
      labelStyle: TextStyle(color: Colors.black54),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ButtonStyle(
        backgroundColor:
        WidgetStatePropertyAll(Color(0xFF000000)), // Black buttons usually but changed to red sometimes in the code
        foregroundColor: WidgetStatePropertyAll(Colors.white),
        padding: WidgetStatePropertyAll(
          EdgeInsets.symmetric(horizontal: 32, vertical: 14),
        ),
        shape: WidgetStatePropertyAll(
          RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(14)),
          ),
        ),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: ButtonStyle(
        foregroundColor: WidgetStatePropertyAll(Color(0xFF6C4DFF)),
      ),
    ),
  );
}
