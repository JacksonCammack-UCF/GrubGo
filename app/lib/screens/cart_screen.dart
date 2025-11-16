import 'package:flutter/material.dart';
import '../utils/api_service.dart';
import '../utils/global_data.dart';
import '../widgets/quantity_stepper.dart';
import '../routes.dart';
import '../widgets/app_topbar.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  bool loading = true;
  List<Map<String, dynamic>> cartItems = [];
  double subtotal = 0;

  static const red = Color(0xFFFF3B30);

  Widget fallbackIcon({double size = 64}) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: Colors.black12,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Icon(
        Icons.restaurant_menu,
        color: Colors.black54,
        size: size * 0.55,
      ),
    );
  }

  Future<void> loadCart() async {
    setState(() => loading = true);

    final items = await APIService.getCart(GlobalData.userId);

    double tempSubtotal = 0;
    for (var item in items) {
      tempSubtotal += (item["price"] ?? 0) * (item["quantity"] ?? 1);
    }

    setState(() {
      cartItems = items;
      subtotal = tempSubtotal;
      loading = false;
    });
  }

  Future<void> updateQuantity(String foodId, int quantity) async {
    await APIService.updateCart(GlobalData.userId, foodId, quantity);
    await loadCart();
  }

  @override
  void initState() {
    super.initState();
    loadCart();
  }

  @override
  Widget build(BuildContext context) {
    const taxMultiplier = 1.07;
    final total = subtotal * taxMultiplier;

    final pointsEarned = (total * 0.10).round();
    final newTotalPoints = GlobalData.points + pointsEarned;

    return Scaffold(
      appBar: const AppTopBar(),
      body: loading
          ? const Center(child: CircularProgressIndicator())
          : cartItems.isEmpty
          ? const Center(child: Text("Your cart is empty"))
          : Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: cartItems.length,
              itemBuilder: (context, index) {
                final item = cartItems[index];

                return Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.black12),
                  ),
                  child: Row(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: (item["imageUrl"] != null &&
                            item["imageUrl"].toString().isNotEmpty &&
                            item["imageUrl"].toString().startsWith("http"))
                            ? Image.network(
                          item["imageUrl"],
                          width: 64,
                          height: 64,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) =>
                              fallbackIcon(size: 64),
                        )
                            : fallbackIcon(size: 64),
                      ),

                      const SizedBox(width: 16),

                      Expanded(
                        child: Column(
                          crossAxisAlignment:
                          CrossAxisAlignment.start,
                          children: [
                            Text(
                              item["name"],
                              style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              "\$${item["price"].toStringAsFixed(2)}",
                              style: const TextStyle(
                                  fontSize: 15,
                                  color: Colors.black54),
                            ),
                          ],
                        ),
                      ),

                      QuantityStepper(
                        quantity: item["quantity"],
                        onChanged: (qty) {
                          updateQuantity(item["foodId"], qty);
                        },
                      ),
                    ],
                  ),
                );
              },
            ),
          ),

          // bottom bar
          Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(
                top: BorderSide(color: Colors.black12),
              ),
            ),
            child: Column(
              children: [
                _summaryRow("Subtotal:", "\$${subtotal.toStringAsFixed(2)}"),
                _summaryRow("Total (incl. tax):", "\$${total.toStringAsFixed(2)}", color: red),
                _summaryRow("Points Earned:", "+$pointsEarned", color: red),
                _summaryRow("New Total Points:", "$newTotalPoints", color: red),

                const SizedBox(height: 16),

                ElevatedButton(
                  onPressed: () async {
                    // Place order AND load CheckoutScreen with returned data
                    final res = await APIService.placeOrder(GlobalData.userId);

                    if (res != null && res["success"] == true) {
                      Navigator.pushNamed(
                        context,
                        AppRoutes.checkout,
                        arguments: res, // send order + new user
                      );
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text("Checkout failed.")),
                      );
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: red,
                    padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text(
                    "Checkout",
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _summaryRow(String label, String value, {Color color = Colors.black}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
          Text(
            value,
            style: TextStyle(
                fontSize: 16, fontWeight: FontWeight.bold, color: color),
          ),
        ],
      ),
    );
  }
}
