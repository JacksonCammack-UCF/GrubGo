import 'package:flutter/material.dart';
import '../widgets/app_topbar.dart';
import '../utils/global_data.dart';
import '../routes.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool expanded = false;

  static const red = Color(0xFFFF3B30);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const AppTopBar(),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(22),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // FULL NAME
                Text(
                  "${GlobalData.firstName} ${GlobalData.lastName}",
                  style: const TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: red,
                  ),
                ),

                // POINTS
                Text(
                  "${GlobalData.points} pts",
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: red,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 26),

            // USERNAME DROPDOWN CARD
            GestureDetector(
              onTap: () {
                setState(() => expanded = !expanded);
              },
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 18),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.black12),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          "@${GlobalData.username}",
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: red,
                          ),
                        ),
                        Icon(
                          expanded
                              ? Icons.keyboard_arrow_up
                              : Icons.keyboard_arrow_down,
                          size: 28,
                          color: Colors.black54,
                        ),
                      ],
                    ),

                    if (expanded) ...[
                      const SizedBox(height: 14),
                      _info("Name",
                          "${GlobalData.firstName} ${GlobalData.lastName}"),
                      _info("Email", GlobalData.email),
                      _info("Phone", GlobalData.phone),
                      _info("User ID", GlobalData.userId),
                    ],
                  ],
                ),
              ),
            ),

            const SizedBox(height: 40),

            // ORDER HISTORY BUTTON
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pushNamed(context, AppRoutes.orders);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: red,
                  padding: const EdgeInsets.symmetric(vertical: 15),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
                child: const Text(
                  "View Order History",
                  style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // profile details
  Widget _info(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: Colors.black54,
            ),
          ),
          const SizedBox(height: 3),
          Text(
            value,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
        ],
      ),
    );
  }
}
