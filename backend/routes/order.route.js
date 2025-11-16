import express from "express";
import { getOrder, getUserOrderHistory } from "../controllers/order.controller.js";

const router = express.Router();

// ORDER ROUTES // will changed to post
router.post("/:id", getOrder);

// will order history
router.get("/history/:userId", getUserOrderHistory);

export default router;