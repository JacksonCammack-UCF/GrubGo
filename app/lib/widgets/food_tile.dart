import 'package:flutter/material.dart';
import '../utils/api_service.dart';
import '../utils/global_data.dart';

class FoodTile extends StatefulWidget {
  final Map<String, dynamic> food;
  final VoidCallback? onDelete;

  const FoodTile({
    super.key,
    required this.food,
    this.onDelete,
  });

  @override
  State<FoodTile> createState() => _FoodTileState();
}

class _FoodTileState extends State<FoodTile> {
  bool adding = false;
  bool stockLoading = false;

  Future<void> addToCart() async {
    setState(() => adding = true);
    await APIService.updateCart(GlobalData.userId, widget.food["_id"], 1);
    setState(() => adding = false);
  }

  Future<void> toggleStock(bool val) async {
    setState(() => stockLoading = true);

    final ok = await APIService.setFoodStock(widget.food["_id"], val);

    setState(() => stockLoading = false);

    if (ok && widget.onDelete != null) {
      widget.onDelete!(); // reload list on home
    }
  }

  Widget fallbackIcon({double size = 56}) {
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

  @override
  Widget build(BuildContext context) {
    final food = widget.food;
    final bool inStock = food["inStock"] == true;

    return Stack(
      alignment: Alignment.center,
      children: [
        Container(
          margin: const EdgeInsets.only(bottom: 14),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.black12),
          ),

          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // TOP ROW
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: (food["imageUrl"] != null &&
                        food["imageUrl"].toString().isNotEmpty)
                        ? Image.network(
                      food["imageUrl"],
                      width: 56,
                      height: 56,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) =>
                          fallbackIcon(size: 56),
                    )
                        : fallbackIcon(size: 56),
                  ),

                  const SizedBox(width: 12),

                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          food["name"] ?? "Unnamed Item",
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          food["category"] ?? "food",
                          style: const TextStyle(
                            fontSize: 13,
                            color: Colors.black45,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          "\$${(food["price"] ?? 0).toStringAsFixed(2)}",
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFFFF3B30),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 10),

              // ENABLE / DISABLE STOCK SWITCH
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    inStock ? "In stock" : "Out of stock",
                    style: TextStyle(
                      fontSize: 14,
                      color: inStock ? Colors.green : Colors.red,
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                  stockLoading
                      ? const SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                      : Switch(
                    value: inStock,
                    onChanged: toggleStock,
                  ),
                ],
              ),

              const SizedBox(height: 10),

              // BUTTONS
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  IconButton(
                    iconSize: 26,
                    icon: adding
                        ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                        : const Icon(Icons.add_shopping_cart,
                        color: Color(0xFF4285F4)),
                    onPressed: adding || !inStock ? null : addToCart,
                  ),

                  IconButton(
                    iconSize: 26,
                    icon: const Icon(Icons.delete, color: Colors.red),
                    onPressed: () async {
                      showDialog(
                        context: context,
                        builder: (ctx) {
                          return AlertDialog(
                            title: const Text(
                              "Delete Food Item",
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
                            content: Text(
                              "Are you sure you want to delete \"${food["name"]}\"?\nThis action cannot be undone.",
                            ),
                            actions: [
                              TextButton(
                                onPressed: () {
                                  Navigator.pop(ctx);
                                },
                                child: const Text(
                                  "Cancel",
                                  style: TextStyle(color: Colors.black54),
                                ),
                              ),

                              TextButton(
                                onPressed: () async {
                                  Navigator.pop(ctx);

                                  final ok = await APIService.deleteFood(food["_id"]);

                                  if (ok) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text("${food["name"]} deleted."),
                                        duration: const Duration(seconds: 2),
                                      ),
                                    );

                                    if (widget.onDelete != null) widget.onDelete!();
                                  } else {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(
                                        content: Text("Failed to delete item."),
                                      ),
                                    );
                                  }
                                },
                                child: const Text(
                                  "Delete Item",
                                  style: TextStyle(
                                    color: Colors.red,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          );
                        },
                      );
                    },
                  ),
                ],
              ),

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: const [
                  Text(
                    "Add to Cart",
                    style: TextStyle(fontSize: 11, color: Colors.black54),
                  ),
                  Text(
                    "Delete Item",
                    style: TextStyle(fontSize: 11, color: Colors.black54),
                  ),
                ],
              ),
            ],
          ),
        ),

        if (!inStock)
          Positioned(
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 35, horizontal: 40),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.65),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Text(
                "OUT OF STOCK",
                style: TextStyle(
                  fontSize: 17,
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.7,
                ),
              ),
            ),
          ),
      ],
    );
  }
}
