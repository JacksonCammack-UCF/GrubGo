import Order from "../models/order.model.js";
import mongoose from "mongoose";
import User from "../models/user.model.js";

export const getOrder = async(req, res) =>{
        // Send ID, so we can grab it!
        const {id} = req.params
    
        // 404 error, not found!
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(404).json({success: "false", message: "Invalid user ID!"});
        }

        // input will be the user's cart
        const order = req.body;
        
        const newOrder = new Order(order);
        // Create new Order
        const tempUser = await User.findById(id);

        // EDIT THIS
        console.log(tempUser);

        newOrder.userId = tempUser._id;
        newOrder.status = "Preparing";
        newOrder.items = tempUser.cart;

        console.log(newOrder);
        
        // Check for it in database!
        try {
            await User.findById(id);
            
            res.status(200).json({success: true, message: " Order has been saved!"});
        } catch (error) {
            console.log("error in getting order:", error.message);
            res.sendStatus(500).json({sucess: false, message: "Server Error"});
        }
}