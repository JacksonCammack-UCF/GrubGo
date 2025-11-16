import 'package:flutter/material.dart';

class QuantityStepper extends StatelessWidget {
  final int quantity;
  final Function(int) onChanged;

  const QuantityStepper({
    super.key,
    required this.quantity,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        // Decrease
        InkWell(
          onTap: () {
            if (quantity > 1) {
              onChanged(quantity - 1);
            } else {
              // remove item
              onChanged(0);
            }
          },
          child: Container(
            width: 32,
            height: 32,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8),
              color: Colors.black12,
            ),
            child: const Icon(Icons.remove, size: 20),
          ),
        ),

        const SizedBox(width: 12),

        Text(
          quantity.toString(),
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),

        const SizedBox(width: 12),

        // Increase
        InkWell(
          onTap: () {
            onChanged(quantity + 1);
          },
          child: Container(
            width: 32,
            height: 32,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8),
              color: Color(0xFFFF3B30),  // RED
            ),
            child: const Icon(Icons.add, size: 20, color: Colors.white),
          ),
        ),
      ],
    );
  }
}
