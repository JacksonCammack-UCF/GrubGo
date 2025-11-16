import 'package:flutter/material.dart';
import '../widgets/app_topbar.dart';
import '../routes.dart';
import '../utils/global_data.dart';

class CheckoutScreen extends StatelessWidget {
  const CheckoutScreen({super.key});

  static const red = Color(0xFFFF3B30);

  @override
  Widget build(BuildContext context) {
    final Map<String, dynamic> data =
    ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;

    final order = data["order"];
    final user = data["user"];

    // Update points in memory
    GlobalData.setUser(user);

    final pointsEarned = order["pointsEarned"];
    final newPoints = user["points"];

    return Scaffold(
      appBar: AppBar(
        title: const Text("Order Summary"),
        leading: IconButton(
          icon: const Icon(Icons.home),
          onPressed: () {
            Navigator.pushNamedAndRemoveUntil(
              context,
              AppRoutes.home,
                  (route) => false,
            );
          },
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(22),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Order Placed!",
              style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold),
            ),

            const SizedBox(height: 20),

            _summaryRow("Subtotal", "\$${order["subtotal"]}", Colors.black),
            _summaryRow("Tax (included)", "x${order["tax"]}", Colors.black),
            _summaryRow("Total", "\$${order["total"]}", red),

            const SizedBox(height: 16),

            _summaryRow("Points Earned", "+$pointsEarned", red),
            _summaryRow("New Total Points", "$newPoints", red),

            const Spacer(),

            ElevatedButton(
              onPressed: () {
                Navigator.pushNamed(context, AppRoutes.orders);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: red,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text(
                "View Order History",
                style: TextStyle(color: Colors.white, fontSize: 18),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _summaryRow(String left, String right, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            left,
            style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w600),
          ),
          Text(
            right,
            style: TextStyle(
                fontSize: 17, fontWeight: FontWeight.bold, color: color),
          ),
        ],
      ),
    );
  }
}
