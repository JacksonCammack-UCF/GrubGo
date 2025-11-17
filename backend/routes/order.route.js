// backend/routes/order.route.js
import express from "express";
import {
  getOrder,
  getUserOrderHistory,
  getOrderById,
} from "../controllers/order.controller.js";

const router = express.Router();

/* ============================================================
   CREATE ORDER (Checkout)
   POST /api/orders/:id
   ============================================================ */
router.post("/:id", getOrder);

/* ============================================================
   GET ORDER BY ORDER ID  (Order Success Page)
   GET /api/orders/order/:orderId
   ============================================================ */
router.get("/order/:orderId", getOrderById);

/* ============================================================
   GET USER ORDER HISTORY
   GET /api/orders/history/:userId
   ============================================================ */
router.get("/history/:userId", getUserOrderHistory);

export default router;
