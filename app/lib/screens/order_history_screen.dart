import 'package:flutter/material.dart';
import '../utils/api_service.dart';
import '../utils/global_data.dart';
import '../widgets/app_topbar.dart';
import '../routes.dart';

class OrderHistoryScreen extends StatefulWidget {
  const OrderHistoryScreen({super.key});

  @override
  State<OrderHistoryScreen> createState() => _OrderHistoryScreenState();
}

class _OrderHistoryScreenState extends State<OrderHistoryScreen> {
  bool loading = true;
  List<dynamic> orders = [];

  @override
  void initState() {
    super.initState();
    loadOrders();
  }

  Future<void> loadOrders() async {
    final result = await APIService.getOrderHistory(GlobalData.userId);

    final foods = await APIService.getFoods();

    final Map<String, dynamic> foodMap = {
      for (var f in foods) f["_id"]: f,
    };

    for (var order in result) {
      for (var item in order["items"]) {
        final food = foodMap[item["foodId"]];
        if (food != null) {
          item["name"] = food["name"];
          item["price"] = food["price"];
        } else {
          item["name"] = "Unknown Item";
          item["price"] = 0;
        }
      }
    }

    setState(() {
      loading = false;
      orders = result;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(

      // ⭐ CUSTOM APPBAR ONLY FOR THIS SCREEN
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 2,

        // LEFT SIDE = HOME ICON
        leading: IconButton(
          icon: const Icon(Icons.home, color: Colors.black),
          onPressed: () {
            Navigator.pushNamedAndRemoveUntil(
              context,
              AppRoutes.home,
                  (route) => false,
            );
          },
        ),

        // TITLE (same as AppTopBar)
        title: const Text(
          "GrubGo",
          style: TextStyle(
            color: Colors.black,
            fontWeight: FontWeight.bold,
            fontSize: 22,
          ),
        ),

        // RIGHT SIDE = EXACT SAME ACTIONS AS AppTopBar
        actions: [
          IconButton(
            icon: const Icon(Icons.shopping_cart_outlined, color: Colors.black),
            onPressed: () {
              Navigator.pushNamed(context, AppRoutes.cart);
            },
          ),
          IconButton(
            icon: const Icon(Icons.person_outline, color: Colors.black),
            onPressed: () {
              Navigator.pushNamed(context, AppRoutes.profile);
            },
          ),
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.black),
            onPressed: () {
              GlobalData.clear();
              Navigator.pushNamedAndRemoveUntil(
                context,
                AppRoutes.login,
                    (_) => false,
              );
            },
          ),
        ],
      ),

      body: loading
          ? const Center(child: CircularProgressIndicator())
          : orders.isEmpty
          ? const Center(child: Text("No previous orders"))
          : ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: orders.length,
        itemBuilder: (context, index) {
          final o = orders[index];

          final idStr = o["_id"].toString();
          final shortId =
              "${idStr.substring(0, 2)}...${idStr.substring(idStr.length - 2)}";

          return Container(
            margin: const EdgeInsets.only(bottom: 18),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border.all(color: Colors.black12),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Order #$shortId",
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                  ),
                ),

                const SizedBox(height: 8),

                Text(
                  "Total: \$${o["total"]}",
                  style: const TextStyle(
                    color: Color(0xFFFF3B30),
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),

                const SizedBox(height: 6),

                Text(
                  "Status: ${o["status"]}",
                  style: const TextStyle(fontSize: 14),
                ),

                const SizedBox(height: 12),

                const Text(
                  "Items:",
                  style: TextStyle(
                      fontWeight: FontWeight.w600, fontSize: 15),
                ),

                const SizedBox(height: 6),

                for (var item in o["items"]) _itemRow(item),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _itemRow(dynamic item) {
    final int qty = (item["qty"] ?? item["quantity"] ?? 1) as int;

    final String name = item["name"]?.toString() ?? "Unknown Item";
    final double price =
    (item["price"] is num) ? (item["price"] as num).toDouble() : 0.0;

    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Text(
        "• $name (\$${price.toStringAsFixed(2)}) x$qty",
        style: const TextStyle(fontSize: 14),
      ),
    );
  }
}
