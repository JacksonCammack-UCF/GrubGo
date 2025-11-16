import 'package:flutter/material.dart';
import '../routes.dart';
import '../utils/api_service.dart';
import '../utils/global_data.dart';

class LoginOtpScreen extends StatefulWidget {
  const LoginOtpScreen({super.key});

  @override
  State<LoginOtpScreen> createState() => _LoginOtpScreenState();
}

class _LoginOtpScreenState extends State<LoginOtpScreen> {
  final otpCtrl = TextEditingController();

  String errorMsg = "";
  bool loading = false;

  late String userId;
  late String email;

  @override
  void didChangeDependencies() {
    final args =
    ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
    userId = args["userId"];
    email = args["email"];
    super.didChangeDependencies();
  }

  Future<void> verifyOtp() async {
    final otp = otpCtrl.text.trim();

    if (otp.isEmpty) {
      setState(() => errorMsg = "Enter the code.");
      return;
    }

    setState(() {
      loading = true;
      errorMsg = "";
    });

    final res = await APIService.verifyLoginOtp(userId, otp);

    setState(() => loading = false);

    if (res == null) {
      setState(() => errorMsg = "Server unreachable.");
      return;
    }

    if (res["success"] != true) {
      setState(() => errorMsg = res["message"] ?? "Invalid code.");
      return;
    }

    // Successfully logged in
    Navigator.pushNamedAndRemoveUntil(
      context,
      AppRoutes.home,
          (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Verify Login")),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Text(
              "A login verification code was sent to\n$email",
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 30),

            TextField(
              controller: otpCtrl,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: "6-digit code"),
            ),

            const SizedBox(height: 20),

            if (errorMsg.isNotEmpty)
              Text(errorMsg,
                  style: const TextStyle(color: Colors.red),
                  textAlign: TextAlign.center),

            const SizedBox(height: 20),

            loading
                ? const CircularProgressIndicator()
                : ElevatedButton(
              onPressed: verifyOtp,
              child: const Text("Verify Login"),
            ),
          ],
        ),
      ),
    );
  }
}
