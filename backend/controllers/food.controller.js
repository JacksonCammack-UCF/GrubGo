// backend/controllers/food.controller.js
import Food from "../models/food.model.js";
import mongoose from "mongoose";

// ----------------------------------------------------------------------------------
// GET FOODS (Supports pagination, but remains backward-compatible)
// ----------------------------------------------------------------------------------
export const getFoods = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || null;  // null → return ALL foods
    const limit = parseInt(req.query.limit) || 9;

    // If no page param → return ALL foods (admin dashboard, menu, etc.)
    if (!page) {
      const foods = await Food.find({});
      return res.status(200).json({
        success: true,
        data: foods,
        totalItems: foods.length,
        message: "Returned all foods (no pagination applied)."
      });
    }

    // Pagination
    const skip = (page - 1) * limit;
    const totalItems = await Food.countDocuments();
    const totalPages = Math.ceil(totalItems / limit);

    const foods = await Food.find({})
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      data: foods,
      page,
      totalPages,
      totalItems,
    });

  } catch (error) {
    console.log("error in fetching the foods: ", error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ----------------------------------------------------------------------------------
// GET FOOD BY ID
// ----------------------------------------------------------------------------------
export const getFoodById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid food ID" });
    }

    const food = await Food.findById(id);
    if (!food) {
      return res.status(404).json({ success: false, message: "Food not found" });
    }

    return res.status(200).json({ success: true, data: food });

  } catch (error) {
    console.log("error in fetching food by id:", error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ----------------------------------------------------------------------------------
// CREATE FOOD (fully validated version)
// ----------------------------------------------------------------------------------
export const createFood = async (req, res) => {
  try {
    const { name, price, category, imageUrl, inStock } = req.body;

    // Validate name + category
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof category !== "string" ||
      !category.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Name and category are required and must be non-empty strings.",
      });
    }

    // Validate price
    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Price is required and must be a non-negative number.",
      });
    }

    const foodData = {
      name: name.trim(),
      price: numericPrice,
      category: category.trim(),
    };

    // Optional boolean
    if (typeof inStock === "boolean") {
      foodData.inStock = inStock;
    }

    // Optional image
    if (typeof imageUrl === "string" && imageUrl.trim().length > 0) {
      foodData.imageUrl = imageUrl.trim();
    }

    const newFood = new Food(foodData);
    await newFood.save();

    return res.status(201).json({ success: true, data: newFood });

  } catch (error) {
    console.error("Error in Create Food:", error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ----------------------------------------------------------------------------------
// UPDATE FOOD (clean validator version)
// ----------------------------------------------------------------------------------
export const updateFood = async (req, res) => {
  const { id } = req.params;
  const food = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Invalid food ID!" });
  }

  try {
    const updatedFood = await Food.findByIdAndUpdate(id, food, {
      new: true,
      runValidators: true,
    });

    if (!updatedFood) {
      return res.status(404).json({
        success: false,
        message: "Food not found!",
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedFood,
    });

  } catch (error) {
    console.log("Error updating food:", error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ----------------------------------------------------------------------------------
// DELETE FOOD
// ----------------------------------------------------------------------------------
export const deleteFood = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Invalid food ID!" });
  }

  try {
    const deletedFood = await Food.findByIdAndDelete(id);

    if (!deletedFood) {
      return res.status(404).json({
        success: false,
        message: "Food not found!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Food deleted!",
    });

  } catch (error) {
    console.log("error in deleting food:", error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
