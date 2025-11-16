import 'package:flutter/material.dart';
import '../routes.dart';
import '../utils/api_service.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final firstCtrl = TextEditingController();
  final lastCtrl = TextEditingController();
  final userCtrl = TextEditingController();
  final emailCtrl = TextEditingController();
  final phoneCtrl = TextEditingController();
  final passCtrl = TextEditingController();

  bool loading = false;
  String errorMsg = "";

  Future<void> handleSignup() async {
    final body = {
      "firstName": firstCtrl.text.trim(),
      "lastName": lastCtrl.text.trim(),
      "username": userCtrl.text.trim(),
      "email": emailCtrl.text.trim(),
      "phone": phoneCtrl.text.trim(),
      "password": passCtrl.text.trim(),
    };

    if (body.values.any((v) => v.isEmpty)) {
      setState(() => errorMsg = "Please fill all fields.");
      return;
    }

    setState(() {
      loading = true;
      errorMsg = "";
    });

    final res = await APIService.signup(body);

    setState(() => loading = false);

    if (res == null) {
      setState(() => errorMsg = "Server unreachable.");
      return;
    }

    if (res["success"] != true) {
      setState(() => errorMsg = res["message"] ?? "Signup failed.");
      return;
    }

    final data = res["data"];
    if (data == null) {
      setState(() => errorMsg = "Invalid server response.");
      return;
    }

    Navigator.pushNamed(context, AppRoutes.signupOtp, arguments: {
      "userId": data["userId"],
      "email": data["email"],
      "purpose": data["purpose"],
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Create Account")),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(22),
        child: Column(
          children: [
            const SizedBox(height: 20),
            const Text(
              "Join GrubGo!",
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 30),

            TextField(controller: firstCtrl, decoration: const InputDecoration(labelText: "First name")),
            TextField(controller: lastCtrl, decoration: const InputDecoration(labelText: "Last name")),
            TextField(controller: userCtrl, decoration: const InputDecoration(labelText: "Username")),
            TextField(controller: emailCtrl, decoration: const InputDecoration(labelText: "Email")),
            TextField(controller: phoneCtrl, decoration: const InputDecoration(labelText: "Phone")),
            TextField(controller: passCtrl, decoration: const InputDecoration(labelText: "Password"), obscureText: true),

            const SizedBox(height: 20),

            if (errorMsg.isNotEmpty)
              Text(errorMsg, style: const TextStyle(color: Colors.red)),

            const SizedBox(height: 20),

            loading
                ? const CircularProgressIndicator()
                : ElevatedButton(
              onPressed: handleSignup,
              child: const Text("Sign Up"),
            ),
          ],
        ),
      ),
    );
  }
}
