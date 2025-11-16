import 'package:flutter/material.dart';

import 'screens/login_screen.dart';
import 'screens/signup_screen.dart';
import 'screens/login_otp_screen.dart';
import 'screens/signup_otp_screen.dart';
import 'screens/home_screen.dart';
import 'screens/cart_screen.dart';
import 'screens/checkout_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/order_history_screen.dart';

class AppRoutes {
  static const String login = "/login";
  static const String signup = "/signup";
  static const String loginOtp = "/login-otp";
  static const String signupOtp = "/signup-otp";
  static const String home = "/home";
  static const String cart = "/cart";
  static const String checkout = "/checkout";
  static const String profile = "/profile";
  static const String orders = "/orders";

  static Map<String, WidgetBuilder> routes = {
    login: (_) => const LoginScreen(),
    signup: (_) => const SignupScreen(),
    loginOtp: (_) => const LoginOtpScreen(),
    signupOtp: (_) => const SignupOtpScreen(),
    home: (_) => const HomeScreen(),
    cart: (_) => const CartScreen(),
    checkout: (_) => const CheckoutScreen(),
    profile: (_) => const ProfileScreen(),
    orders: (_) => const OrderHistoryScreen(),
  };
}
