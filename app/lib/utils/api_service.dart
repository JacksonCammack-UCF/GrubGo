// lib/utils/api_service.dart

import 'dart:convert';
import 'package:http/http.dart' as http;
import 'global_data.dart';

class APIService {
  static const String baseURL = "http://10.0.2.2:5050/api";

  // SIGNUP
  static Future<Map<String, dynamic>?> signup(Map<String, dynamic> body) async {
    final url = Uri.parse("$baseURL/users/signup");

    try {
      final res = await http.post(
        url,
        headers: {"Content-Type": "application/json"},
        body: jsonEncode(body),
      );

      return jsonDecode(res.body);
    } catch (_) {
      return null;
    }
  }

  // LOGIN (identifier OR username OR email)
  static Future<Map<String, dynamic>?> login(
      String identifier, String password) async {
    final url = Uri.parse("$baseURL/users/login");

    try {
      final res = await http.post(
        url,
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "identifier": identifier,
          "password": password,
        }),
      );

      return jsonDecode(res.body);
    } catch (_) {
      return null;
    }
  }

  // VERIFY EMAIL OTP
  static Future<Map<String, dynamic>?> verifyEmailOtp(
      String userId, String otp) async {
    final url = Uri.parse("$baseURL/auth/verify-email-otp");

    try {
      final res = await http.post(url,
          headers: {"Content-Type": "application/json"},
          body: jsonEncode({"userId": userId, "otp": otp}));

      return jsonDecode(res.body);
    } catch (_) {
      return null;
    }
  }

  // VERIFY 2FA LOGIN OTP
  static Future<Map<String, dynamic>?> verifyLoginOtp(
      String userId, String otp) async {
    final url = Uri.parse("$baseURL/auth/verify-2fa-otp");

    try {
      final res = await http.post(url,
          headers: {"Content-Type": "application/json"},
          body: jsonEncode({"userId": userId, "otp": otp}));

      final json = jsonDecode(res.body);

      if (json["success"] == true && json["data"] != null) {
        GlobalData.setUser(json["data"]);
      }

      return json;
    } catch (_) {
      return null;
    }
  }

// CREATE FOOD
  static Future<bool> createFood(Map<String, dynamic> body) async {
    final url = Uri.parse("$baseURL/foods");

    try {
      final res = await http.post(
        url,
        headers: {"Content-Type": "application/json"},
        body: jsonEncode(body),
      );

      return res.statusCode == 200 || res.statusCode == 201;
    } catch (e) {
      return false;
    }
  }

// DELETE FOOD
  static Future<bool> deleteFood(String foodId) async {
    final url = Uri.parse("$baseURL/foods/$foodId");

    try {
      final res = await http.delete(url);
      return res.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  // GET FOODS
  static Future<List<dynamic>> getFoods() async {
    final url = Uri.parse("$baseURL/foods");

    try {
      final res = await http.get(url);
      return jsonDecode(res.body)["data"] ?? [];
    } catch (_) {
      return [];
    }
  }

  // UPDATE CART
  static Future<bool> updateCart(String userId, String foodId, int qty) async {
    final url = Uri.parse("$baseURL/users/cart/$userId");

    try {
      final res = await http.post(
        url,
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "foodId": foodId,
          "quantity": qty,   // IMPORTANT
        }),
      );

      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  // GET CART
  static Future<List<Map<String, dynamic>>> getCart(String userId) async {
    try {
      final usersUrl = Uri.parse("$baseURL/users");
      final foodsUrl = Uri.parse("$baseURL/foods");

      final userRes = await http.get(usersUrl);
      final foodRes = await http.get(foodsUrl);

      final users = jsonDecode(userRes.body)["data"];
      final foods = jsonDecode(foodRes.body)["data"];

      final user =
      users.firstWhere((u) => u["_id"] == userId, orElse: () => null);

      if (user == null) return [];

      final cartRaw = user["cart"] ?? [];
      List<Map<String, dynamic>> merged = [];

      for (final item in cartRaw) {
        final food =
        foods.firstWhere((f) => f["_id"] == item["foodId"], orElse: () => null);
        if (food == null) continue;

        merged.add({
          "foodId": item["foodId"],
          "quantity": item["quantity"] ?? 1,
          "name": food["name"],
          "price": food["price"],
          "imageUrl": food["imageUrl"],
          "inStock": food["inStock"],
        });
      }

      return merged;
    } catch (_) {
      return [];
    }
  }

// ORDERS — PLACE ORDER
  static Future<Map<String, dynamic>?> placeOrder(String userId) async {
    final url = Uri.parse("$baseURL/orders/$userId");
    try {
      final res = await http.post(url, headers: {"Content-Type": "application/json"});
      if (res.statusCode == 200) return jsonDecode(res.body);
      return null;
    } catch (_) {
      return null;
    }
  }


  // get order history
  static Future<List<dynamic>> getOrderHistory(String userId) async {
    final url = Uri.parse("$baseURL/orders/history/$userId");
    try {
      final res = await http.get(url);
      if (res.statusCode == 200) {
        return jsonDecode(res.body)["orders"] ?? [];
      }
      return [];
    } catch (_) {
      return [];
    }
  }

}
