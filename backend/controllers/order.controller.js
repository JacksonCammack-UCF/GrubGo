// backend/controllers/order.controller.js
import Order from "../models/order.model.js";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import Food from "../models/food.model.js";

export const getOrder = async(req, res) =>{
        // Send ID, so we can grab it!
        const {id} = req.params
    
        // 404 error, not found!
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(404).json({success: "false", message: "Invalid user ID!"});
        }
        
        const tempUser = await User.findById(id);
        
        if (!tempUser) 
            return res.status(404).json({ success: false, message: "User not found!" });

        // Create a new Order
        const newOrder = new Order({
         userId : tempUser._id,
         status : "Preparing",
         items : tempUser.cart
       });

        // Get totals
        let subtotal = 0;
        let tax = 1.07; 
        let total = 0;
        let orderLength = newOrder.items.length;
        
       
       // Loop through cart

        try {
            for (let i = 0; i < orderLength; i++) {
            const item = newOrder.items[i];
            const foodID = item.foodId;

            // from will probably not needed but fallback in case frontend forget to change specific ways of typing it
            const quantity = item.qty ?? item.quantity ?? 1;

            

            const food = await Food.findById(foodID);

            if (!food) {
                console.log(`Food not found for ID: ${foodID}`);
                continue;
            }

            // get price and calculate subtotal
            const price = food.price;
            subtotal += price * quantity;

        }
        // Update total and subtotals
        total = subtotal * tax;
        total = parseFloat(total.toFixed(2));
        subtotal = parseFloat(subtotal.toFixed(2));

        // Add to the order
        newOrder.subtotal = subtotal
        newOrder.tax = tax;
        newOrder.total = total 

        // UPDATE POINTS EARNED
        const points_earned = Math.round(total * 0.1);

        // will send points & save
        newOrder.pointsEarned = points_earned;
        await newOrder.save();

        const total_points = + tempUser.points + points_earned;
        
        await User.updateOne({_id: id}, {points: total_points});

        res.status(200).json({success: true, message: "Order has been saved!", order: newOrder, user: tempUser});
        } catch (error) {
            console.log("error in getting order:", error.message);
            res.status(500).json({success: false, message: "Server Error"});
        }


}


// will get order history
export const getUserOrderHistory = async (req, res) => {
    const { userId } = req.params;

    try {
        // sorted by creation date descending
        const orders = await Order.find({ userId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            orders,
        });

    } catch (err) {
        console.error("Error loading order history:", err.message);

        res.status(500).json({
            success: false,
            message: "Server error while loading order history",
        });
    }
};
