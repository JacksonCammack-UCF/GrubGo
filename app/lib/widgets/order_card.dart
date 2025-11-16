import 'package:flutter/material.dart';

class OrderCard extends StatelessWidget {
  final Map<String, dynamic> order;
  const OrderCard({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.black12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "Order Total: \$${order["total"]}",
            style: const TextStyle(
                fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 6),
          Text(
            "${order["items"]?.length ?? 0} items",
            style: const TextStyle(fontSize: 15, color: Colors.black54),
          ),
          const SizedBox(height: 6),
          Text(
            "Status: ${order["status"]}",
            style: const TextStyle(fontSize: 15),
          ),
          const SizedBox(height: 6),
          Text(
            order["createdAt"] ?? "",
            style: const TextStyle(fontSize: 13, color: Colors.black38),
          ),
        ],
      ),
    );
  }
}
