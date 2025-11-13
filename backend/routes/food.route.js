import express from "express";

import { createFood, deleteFood, getFoods, updateFood } from "../controllers/food.controller.js";

const router = express.Router();

// GET PRODUCT
router.get("/", getFoods)

// CREATE PRODUCT
router.post("/", createFood)

// UPDATE PRODUCT
router.put("/:id", updateFood)

// DELETE PRODUCT
router.delete("/:id", deleteFood)

export default router;