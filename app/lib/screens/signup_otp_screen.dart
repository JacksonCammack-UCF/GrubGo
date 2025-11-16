import 'package:flutter/material.dart';
import '../routes.dart';
import '../utils/api_service.dart';

class SignupOtpScreen extends StatefulWidget {
  const SignupOtpScreen({super.key});

  @override
  State<SignupOtpScreen> createState() => _SignupOtpScreenState();
}

class _SignupOtpScreenState extends State<SignupOtpScreen> {
  final otpCtrl = TextEditingController();

  bool loading = false;
  String errorMsg = "";
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

    final res = await APIService.verifyEmailOtp(userId, otp);

    setState(() => loading = false);

    if (res == null) {
      setState(() => errorMsg = "Server unreachable.");
      return;
    }

    if (res["status"] == "RESEND") {
      setState(() => errorMsg = "Code expired. A new OTP was sent.");
      return;
    }

    // Regular failure
    if (res["success"] != true) {
      setState(() => errorMsg = res["message"] ?? "Invalid code.");
      return;
    }

    // SUCCESS
    Navigator.pushReplacementNamed(context, AppRoutes.login);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Verify Email")),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Text(
              "A verification code was sent to\n$email",
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 30),

            TextField(
              controller: otpCtrl,
              decoration: const InputDecoration(labelText: "6-digit code"),
              keyboardType: TextInputType.number,
            ),

            const SizedBox(height: 20),

            if (errorMsg.isNotEmpty)
              Text(
                errorMsg,
                style: const TextStyle(color: Colors.red),
              ),

            const SizedBox(height: 20),

            loading
                ? const CircularProgressIndicator()
                : ElevatedButton(
              onPressed: verifyOtp,
              child: const Text("Verify Email"),
            ),
          ],
        ),
      ),
    );
  }
}
