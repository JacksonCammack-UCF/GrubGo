//backend/controllers/food.controller.js
import Food from "../models/food.model.js";
import mongoose from "mongoose";


export const getFoods = async(req, res) =>{
    try {
        const foods = await Food.find({});
        res.status(200).json({success: true, data: foods })
    } catch (error) {
        console.log("error in fetching the foods: ", error.message);
        res.status(500).json({success: false, message: "Server Error"})
        
    }
}

export const createFood = async(req, res) =>{
    try {
        const {name, price, category, imageUrl, inStock} = req.body;

        if ( typeof name !== "string" || !name.trim() || typeof category !== "string" || !category.trim() ){
            return  res.status(400).json({success: false, message: "Name and category are required and must be non-empty strings."});
        }

        if (price === null || price === undefined) {
        return res.status(400).json({ success: false, message: "Price is required and must be a non-negative number." });
        }

        const numericPrice = Number(price);
        if (!Number.isFinite(numericPrice) || numericPrice < 0) {
        return res.status(400).json({ success: false, message: "Price is required and must be a non-negative number."});
        }
        const foodData = {
            name: name.trim(),
            price: numericPrice,
            category: category.trim(),
        };

        if (typeof inStock === "boolean") {
            foodData.inStock = inStock;
        }

        if (typeof imageUrl === "string" && imageUrl.trim().length > 0) {
            foodData.imageUrl = imageUrl.trim();
        }

        const newFood = new Food(foodData);
        await newFood.save();

        res.status(201).json({success: true, data: newFood});
    } catch (error) {
        console.error("Error in Create Food:", error.message);
        res.status(500).json({success: false, message: "Server Error"});
    }
}

export const updateFood = async(req, res) =>{
    const{id} = req.params;
    const food = req.body;

    // 404 error, not found!
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({success: false, message: "Invalid food ID!"});
    }

    try {
        // new:true allows you to update the object!
        const updatedFood = await Food.findByIdAndUpdate(id, food, {new:true, runValidators: true});
        if (!updatedFood) {
            return res.status(404).json({ success: false, message: "Food not found!" });
        }
        
        res.status(200).json({ success: true, data: updatedFood}); 
    } catch (error) {

        res.status(500).json({ success: false, message: "Server Error"});
    }
}


export const deleteFood = async (req, res) => {
    // Send ID, so we can grab it!
    const {id} = req.params
    console.log("id:",id);

    // 404 error, not found!
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({success: false, message: "Invalid food ID!"});
    }
    
    // Check for it in database!
    try {
        const deletedFood = await Food.findByIdAndDelete(id);
        if (!deletedFood) {
            return res.status(404).json({ success: false, message: "Food not found!" });
        }
        res.status(200).json({success: true, message: "Food deleted!"});
    } catch (error) {
        console.log("error in deleting food:", error.message);
        res.status(500).json({success: false, message: "Server Error"});
        
    }
}