// lib/utils/global_data.dart

class GlobalData {
  static String userId = '';
  static String firstName = '';
  static String lastName = '';
  static String username = '';
  static String email = '';
  static String phone = '';
  static int points = 0;

  static void clear() {
    userId = '';
    firstName = '';
    lastName = '';
    username = '';
    email = '';
    phone = '';
    points = 0;
  }

  static void setUser(Map<String, dynamic> user) {
    userId = user["_id"] ?? "";
    firstName = user["firstName"] ?? "";
    lastName = user["lastName"] ?? "";
    username = user["username"] ?? "";
    email = user["email"] ?? "";
    phone = user["phone"] ?? "";
    points = user["points"] ?? 0;
  }
}
