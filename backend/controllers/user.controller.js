import mongoose from "mongoose";
import User from "../models/user.model.js";


// GET USERS
export const getUsers = async(req, res) =>{
    try {
        const users = await User.find({});
        res.status(200).json({success: true, data: users})
    } catch (error) {
        console.log("error in fetching the products: ", error.message);
        res.status(500).json({success: false, message: "Server Error"})      
    }
}

// DELETE USER
export const deleteUser = async(req, res) =>{
        // Send ID, so we can grab it!
        const {id} = req.params
        console.log("id:",id);
    
        // 404 error, not found!
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(404).json({success: "false", message: "Invalid user ID!"});
        }
        
        // Check for it in database!
        try {
            await User.findByIdAndDelete(id);
            res.status(200).json({success: true, message: "User deleted!"});
        } catch (error) {
            console.log("error in deleting product:", error.message);
            res.sendStatus(500).json({sucess: false, message: "Server Error"});
        }
}

// LOGIN
export const doLogin = async (req, res) =>{

    const { email, password } = req.body;
    if(!email || !password){ // Check all requirements
        return res.status(400).json({success:false, message: "Please fill in all sections."});
    }
  
    try {
        const login = await User.find({email:email, password:password});
        console.log({login});

        if (login.length == 0){ // check if info matches database
            return res.status(400).json({success:false, message: "Email / Password incorrect."});
        }

        res.status(200).json({success: true, data: login, message: "Success, Logged In!" })
    
    } catch (error) {
        console.log("error in fetching the products: ", error.message);
        res.status(500).json({success: false, message: "Server Error"})
        
    }
}

// SIGN UP
export const doSignup = async (req, res) => {
    
    function isValidEmail(email){
        return (email.includes('@') && email.includes('.'));
    }
    const user = req.body;

    if(!user.email || !user.username || !user.password || !user.firstName || user.LastName || !user.phone){ // Check all requirements
        return res.status(400).json({success:false, message: "Please fill in all sections."});
    }
    console.log(user);

    // check if valid email
    if(!isValidEmail(user.email)){
        return res.status(400).json({success:false, message: "Not a valid email."});
    }

    // check if email already exists in database
    const emailCheck = await User.find({email: user.email});
    if (emailCheck.length != 0){
            return res.status(400).json({success:false, message: "Email already used."});
        }

    // INITIALIZE CART AND POINTS
    user.points = 200;
    user.cart = [];
    console.log(user);

    const newUser = new User(user) // Create new user
    console.log(newUser);

    try {
        // IMPLEMENT WITH DATABASE
        await newUser.save();
        res.status(200).json({success: "true", data: newUser});
    } catch (error) {
        console.error("Error in Create product:", error.message)
        res.status(500).json({success: "false", message: "Server Error"});
        
    }
}

// UPDATE CART
export const updateCart = async (req, res) =>{
    const {id} = req.params
    const { foodId, quantity } = req.body;

    try {
        if (quantity === 0) {
            await User.updateOne(
                { _id: id },
                { $pull: { cart: { foodId } } } // remove any matching foodId
            );
            return res.status(200).json({ message: 'Item removed from cart' });
        }

    // Try to update quantity if item already exists
        const result = await User.updateOne(
            { _id: id, 'cart.foodId': foodId },
            { $set: { 'cart.$.quantity': quantity } }
        );

    if (result.matchedCount === 0) {
      // Item not found → push new item
      await User.updateOne(
        { _id: id },
        { $push: { cart: { foodId, quantity } } }
      );
      return res.status(200).json({ message: 'Item added to cart' });
    }

    res.status(200).json({ message: 'Cart updated successfully' });

    } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to update cart' });
    }
  

}

