import 'package:flutter/material.dart';
import 'routes.dart';
import 'themes/app_theme.dart';

void main() {
  runApp(const GrubGoApp());
}

class GrubGoApp extends StatelessWidget {
  const GrubGoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'GrubGo',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      initialRoute: AppRoutes.login,
      routes: AppRoutes.routes,
    );
  }
}
