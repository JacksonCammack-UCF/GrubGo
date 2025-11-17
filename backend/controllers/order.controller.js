// backend/controllers/order.controller.js
import Order from "../models/order.model.js";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import Food from "../models/food.model.js";

/* ============================================================
   CREATE ORDER (Checkout)
   ============================================================ */
export const getOrder = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Invalid user ID!" });
  }

  try {
    const tempUser = await User.findById(id);

    if (!tempUser) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }

    // ⭐ Populate full food details for each cart item
    const populatedItems = await Promise.all(
      tempUser.cart.map(async (cartItem) => {
        const food = await Food.findById(cartItem.foodId);

        return {
          foodId: cartItem.foodId,
          qty: cartItem.qty ?? cartItem.quantity ?? 1,

          // ⭐ Add full food metadata (for UI)
          name: food?.name || "Unknown Item",
          price: food?.price || 0,
          imageUrl: food?.imageUrl || "",
          category: food?.category || "",
        };
      })
    );

    // ⭐ Create order
    const newOrder = new Order({
      userId: tempUser._id,
      status: "Preparing",
      items: populatedItems,
    });

    /* -----------------------------------------------
     *  Calculate totals
     * --------------------------------------------- */
    let subtotal = 0;
    const tax = 1.07;

    populatedItems.forEach((item) => {
      subtotal += (item.price || 0) * (item.qty || 1);
    });

    subtotal = parseFloat(subtotal.toFixed(2));
    let total = parseFloat((subtotal * tax).toFixed(2));

    newOrder.subtotal = subtotal;
    newOrder.tax = tax;
    newOrder.total = total;

    /* -----------------------------------------------
     *  Points
     * --------------------------------------------- */
    const pointsEarned = Math.round(total * 0.1);
    newOrder.pointsEarned = pointsEarned;

    await newOrder.save();

    const totalPoints = (tempUser.points || 0) + pointsEarned;
    await User.updateOne({ _id: id }, { points: totalPoints });

    return res.status(200).json({
      success: true,
      message: "Order has been saved!",
      order: newOrder,
      user: { ...tempUser.toObject(), points: totalPoints },
    });

  } catch (error) {
    console.log("error in getting order:", error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

/* ============================================================
   GET ORDER BY ID  (For Order Success Page)
   ============================================================ */
export const getOrderById = async (req, res) => {
  const { orderId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(404).json({ success: false, message: "Invalid order ID!" });
  }

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // ⭐ Ensure all items include full food details
    const populatedItems = await Promise.all(
      order.items.map(async (item) => {
        const food = await Food.findById(item.foodId);

        return {
          ...item,
          name: item.name || food?.name || "Unknown Item",
          price: item.price || food?.price || 0,
          imageUrl: item.imageUrl || food?.imageUrl || "",
          category: item.category || food?.category || "",
        };
      })
    );

    return res.status(200).json({
      success: true,
      order: {
        ...order.toObject(),
        items: populatedItems,
      },
    });

  } catch (err) {
    console.error("Error fetching order:", err.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

/* ============================================================
   GET ALL ORDERS FOR USER  (Order History)
   ============================================================ */
export const getUserOrderHistory = async (req, res) => {
  const { userId } = req.params;

  try {
    let orders = await Order.find({ userId }).sort({ createdAt: -1 });

    // ⭐ Make sure history also contains full item metadata
    orders = await Promise.all(
      orders.map(async (order) => {
        const items = await Promise.all(
          order.items.map(async (item) => {
            const food = await Food.findById(item.foodId);
            return {
              ...item,
              name: item.name || food?.name || "Unknown Item",
              price: item.price || food?.price || 0,
              imageUrl: item.imageUrl || food?.imageUrl || "",
              category: item.category || food?.category || "",
            };
          })
        );

        return {
          ...order.toObject(),
          items,
        };
      })
    );

    return res.status(200).json({
      success: true,
      orders,
    });

  } catch (err) {
    console.error("Error loading order history:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server error while loading order history",
    });
  }
};
