// backend/routes/food.route.js
import express from "express";

import { createFood, deleteFood, getFoods, updateFood, getFoodById } from "../controllers/food.controller.js";

import { verifyAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// GET PRODUCT
router.get("/", getFoods)

// Admin-only: create / update / delete foods
// CREATE PRODUCT
router.post("/", verifyAdmin, createFood)
// UPDATE PRODUCT
router.put("/:id", verifyAdmin, updateFood)
// DELETE PRODUCT
router.delete("/:id", verifyAdmin, deleteFood)

// GET PRODUCT BY ID
router.get("/:id", getFoodById);

export default router;