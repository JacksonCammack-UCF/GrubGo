import 'package:flutter/material.dart';
import '../utils/api_service.dart';
import '../widgets/app_topbar.dart';
import '../widgets/food_tile.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<dynamic> foods = [];
  bool loading = true;

  // Load all foods from backend
  Future<void> loadFoods() async {
    setState(() => loading = true);

    final data = await APIService.getFoods();

    // sort in-stock first
    data.sort((a, b) {
      final aStock = a["inStock"] == true;
      final bStock = b["inStock"] == true;
      return aStock == bStock ? 0 : (aStock ? -1 : 1);
    });

    setState(() {
      foods = data;
      loading = false;
    });
  }

  @override
  void initState() {
    super.initState();
    loadFoods();
  }

  // Add Food Popup
  void openAddFoodDialog() {
    final nameCtrl = TextEditingController();
    final typeCtrl = TextEditingController();
    final priceCtrl = TextEditingController();
    final imgCtrl = TextEditingController();
    bool inStock = true;

    String error = "";
    bool localLoading = false;

    showDialog(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setPop) {
            Future<void> submit() async {
              if (nameCtrl.text.isEmpty ||
                  typeCtrl.text.isEmpty ||
                  priceCtrl.text.isEmpty) {
                setPop(() => error = "Fill all required fields.");
                return;
              }

              double? priceValue = double.tryParse(priceCtrl.text.trim());
              if (priceValue == null || priceValue <= 0) {
                setPop(() => error = "Price must be a valid number > 0.");
                return;
              }

              final body = {
                "name": nameCtrl.text.trim(),
                "price": priceValue,
                "category": typeCtrl.text.trim(),
                "imageUrl": imgCtrl.text.trim().isEmpty
                    ? "https://via.placeholder.com/150"
                    : imgCtrl.text.trim(),
                "inStock": true,
              };

              setPop(() {
                localLoading = true;
                error = "";
              });

              final ok = await APIService.createFood(body);

              setPop(() => localLoading = false);

              if (!ok) {
                setPop(() => error = "Failed to add food.");
                return;
              }

              Navigator.pop(ctx);
              await loadFoods();
            }

            return AlertDialog(
              title: const Text("Add Food Item"),
              content: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    TextField(
                      controller: nameCtrl,
                      decoration: const InputDecoration(labelText: "Name"),
                    ),
                    TextField(
                      controller: typeCtrl,
                      decoration: const InputDecoration(labelText: "Category"),
                    ),
                    TextField(
                      controller: priceCtrl,
                      keyboardType: TextInputType.number,
                      decoration:
                      const InputDecoration(labelText: "Price (e.g. 4.99)"),
                    ),
                    TextField(
                      controller: imgCtrl,
                      decoration: const InputDecoration(
                          labelText: "Image URL (optional)"),
                    ),

                    const SizedBox(height: 12),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text("In stock"),
                        Switch(
                          value: inStock,
                          onChanged: (val) {
                            setPop(() => inStock = val);
                          },
                        ),
                      ],
                    ),

                    if (error.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(top: 8),
                        child: Text(
                          error,
                          style: const TextStyle(color: Colors.red),
                        ),
                      ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: localLoading ? null : () => Navigator.pop(ctx),
                  child: const Text("Cancel"),
                ),
                ElevatedButton(
                  onPressed: localLoading ? null : submit,
                  child: localLoading
                      ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ))
                      : const Text("Add Food"),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const AppTopBar(),

      body: loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
        onRefresh: loadFoods,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // HEADER ROW
            Row(
              children: [
                Text(
                  "${foods.length} food items loaded",
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w500,
                    color: Colors.black87,
                  ),
                ),
                const Spacer(),

                ElevatedButton(
                  onPressed: openAddFoodDialog,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 18,
                      vertical: 10,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                  ),
                  child: const Text(
                    "Add Food",
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 20),

            // FOOD LIST
            for (final food in foods)
              FoodTile(
                food: food,
                onDelete: () => loadFoods(),   // refresh list after delete
              ),

          ],
        ),
      ),
    );
  }
}
