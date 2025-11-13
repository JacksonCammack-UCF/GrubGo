import Food from "../models/food.model.js";
import mongoose from "mongoose";


export const getFoods = async(req, res) =>{
    try {
        const foods = await Food.find({});
        res.status(200).json({success: true, data: foods })
        res.status(200).json({success: true, message: "Showing all foods!"})
    } catch (error) {
        console.log("error in fetching the foods: ", error.message);
        res.status(500).json({success: false, message: "Server Error"})
        
    }
}

export const createFood = async(req, res) =>{
    
    const food = req.body; // User input, will send this data

    if(!food.name || !food.price || !food.category || !food.inStock || !food.imageUrl ){ // Check all requirements
        return res.status(400).json({success:false, message: "Please fill in all requirements!"});
    }

    const newFood = new Food(food) // Create new food

    try {
        // ADD FOOD TO DATABASE
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
        return res.status(404).json({success: "false", message: "Invalid food ID!"});
    }

    try {
        // new:true allows you to update the object!
        const updatedFood = await Food.findByIdAndUpdate(id, food, {new:true})
        res.status(200).json({ sucess: "true", data: updatedFood}); 
    } catch (error) {

        res.status(500).json({ sucess: "false", message: "Server Error"});
    }
}

export const deleteFood = async (req, res) => {
    // Send ID, so we can grab it!
    const {id} = req.params
    console.log("id:",id);

    // 404 error, not found!
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({success: "false", message: "Invalid food ID!"});
    }
    
    // Check for it in database!
    try {
        await Food.findByIdAndDelete(id);
        res.status(200).json({success: true, message: "Food deleted!"});
    } catch (error) {
        console.log("error in deleting food:", error.message);
        res.sendStatus(500).json({sucess: false, message: "Server Error"});
        
    }
}