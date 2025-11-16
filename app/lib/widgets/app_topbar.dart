import 'package:flutter/material.dart';
import '../routes.dart';
import '../utils/global_data.dart';

class AppTopBar extends StatelessWidget implements PreferredSizeWidget {
  const AppTopBar({super.key});

  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: const Text(
        "GrubGo",
        style: TextStyle(
          color: Colors.black,
          fontWeight: FontWeight.bold,
          fontSize: 22,
        ),
      ),
      elevation: 2,
      actions: [
        // CART
        IconButton(
          icon: const Icon(Icons.shopping_cart_outlined, color: Colors.black),
          onPressed: () {
            Navigator.pushNamed(context, AppRoutes.cart);
          },
        ),

        // PROFILE
        IconButton(
          icon: const Icon(Icons.person_outline, color: Colors.black),
          onPressed: () {
            Navigator.pushNamed(context, AppRoutes.profile);
          },
        ),

        // LOGOUT ICON
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
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(58);
}
