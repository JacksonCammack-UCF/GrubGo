import 'package:flutter/material.dart';
import '../utils/api_service.dart';
import '../widgets/app_topbar.dart';
import '../widgets/food_tile.dart';
import '../utils/global_data.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ScrollController _scrollController = ScrollController();
  int currentPage = 1;
  int pageSize = 5;

  int get totalPages {
    if (foods.isEmpty) return 1;
    return (foods.length / pageSize).ceil();
  }

  List<dynamic> get paginatedFoods {
    final start = (currentPage - 1) * pageSize;
    final end = start + pageSize;
    return foods.sublist(start, end > foods.length ? foods.length : end);
  }

  List<dynamic> foods = [];
  bool loading = true;

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
      currentPage = 1;
    });
  }

  @override
  void initState() {
    super.initState();
    loadFoods();
  }

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
                setPop(() => error = "Price must be valid.");
                return;
              }

              final body = {
                "name": nameCtrl.text.trim(),
                "price": priceValue,
                "category": typeCtrl.text.trim(),
                "imageUrl": imgCtrl.text.trim(),
                "inStock": inStock,
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
                      decoration: const InputDecoration(labelText: "Price"),
                      keyboardType: TextInputType.number,
                    ),
                    TextField(
                      controller: imgCtrl,
                      decoration: const InputDecoration(labelText: "Image URL (optional)"),
                    ),

                    const SizedBox(height: 12),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text("In stock"),
                        Switch(
                          value: inStock,
                          onChanged: (v) => setPop(() => inStock = v),
                        ),
                      ],
                    ),

                    if (error.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(top: 8),
                        child: Text(error, style: const TextStyle(color: Colors.red)),
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
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                      : const Text("Add"),
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
    final bool isAdmin = GlobalData.isAdmin;

    return Scaffold(
      appBar: const AppTopBar(),

      body: loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
        onRefresh: loadFoods,
        child: ListView(
          controller: _scrollController,
          padding: const EdgeInsets.all(16),
          children: [
            Row(
              children: [
                Text(
                  "${foods.length} food items loaded",
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const Spacer(),

                // ADMIN ONLY ADD FOOD BUTTON
                if (isAdmin)
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

            for (final food in paginatedFoods)
              FoodTile(
                food: food,
                onDelete: () => loadFoods(),
              ),

            const SizedBox(height: 20),

            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton(
                  icon: const Icon(Icons.arrow_left, size: 32),
                  onPressed: currentPage > 1
                      ? () {
                    setState(() => currentPage--);
                    _scrollController.animateTo(
                      0,
                      duration:
                      const Duration(milliseconds: 300),
                      curve: Curves.easeOut,
                    );
                  }
                      : null,
                ),
                Text(
                  "Page $currentPage of $totalPages",
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.arrow_right, size: 32),
                  onPressed: currentPage < totalPages
                      ? () {
                    setState(() => currentPage++);
                    _scrollController.animateTo(
                      0,
                      duration:
                      const Duration(milliseconds: 300),
                      curve: Curves.easeOut,
                    );
                  }
                      : null,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
