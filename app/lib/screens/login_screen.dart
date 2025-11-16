import 'package:flutter/material.dart';
import '../routes.dart';
import '../utils/api_service.dart';
import '../utils/global_data.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final idCtrl = TextEditingController();
  final passCtrl = TextEditingController();

  bool loading = false;
  String errorMsg = "";

  Future<void> handleLogin() async {
    final identifier = idCtrl.text.trim();
    final password = passCtrl.text.trim();

    if (identifier.isEmpty || password.isEmpty) {
      setState(() => errorMsg = "Enter your username/email and password.");
      return;
    }

    setState(() {
      loading = true;
      errorMsg = "";
    });

    final res = await APIService.login(identifier, password);

    setState(() => loading = false);

    if (res == null) {
      setState(() => errorMsg = "Server unreachable.");
      return;
    }

    if (res["success"] != true) {
      setState(() => errorMsg = res["message"] ?? "Login failed.");
      return;
    }

    // Login returns PENDING unless veri
    final status = res["status"];
    final data = res["data"];

    if (status == "PENDING" && data != null) {
      final purpose = data["purpose"];
      final userId = data["userId"];
      final email = data["email"];

      // UNVERIFIED EMAIL
      if (purpose == "EMAIL_VERIFICATION") {
        Navigator.pushNamed(context, AppRoutes.signupOtp, arguments: {
          "userId": userId,
          "email": email,
          "purpose": purpose,
        });
        return;
      }

      // VERIFIED
      if (purpose == "TWO_FACTOR_AUTH") {
        Navigator.pushNamed(context, AppRoutes.loginOtp, arguments: {
          "userId": userId,
          "email": email,
          "purpose": purpose,
        });
        return;
      }
    }

    setState(() => errorMsg = "Unexpected response from server.");
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Login")),
      body: Padding(
        padding: const EdgeInsets.all(22),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 40),
            const Text(
              "Welcome to GrubGo",
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 40),

            TextField(
              controller: idCtrl,
              decoration:
              const InputDecoration(labelText: "Email or username"),
            ),

            const SizedBox(height: 20),

            TextField(
              controller: passCtrl,
              decoration: const InputDecoration(labelText: "Password"),
              obscureText: true,
            ),

            const SizedBox(height: 20),

            if (errorMsg.isNotEmpty)
              Text(
                errorMsg,
                style: const TextStyle(color: Colors.red),
                textAlign: TextAlign.center,
              ),

            const SizedBox(height: 20),

            loading
                ? const Center(child: CircularProgressIndicator())
                : ElevatedButton(
              onPressed: handleLogin,
              child: const Text("Login"),
            ),

            const SizedBox(height: 16),

            TextButton(
              onPressed: () {
                Navigator.pushNamed(context, AppRoutes.signup);
              },
              child: const Text("Create a new account"),
            ),
          ],
        ),
      ),
    );
  }
}
