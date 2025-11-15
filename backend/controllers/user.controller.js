import mongoose from "mongoose";
import bcrypt from "bcrypt";
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
  try {
    const { email, username, identifier, password } = req.body;

    const loginField = email || username || identifier;

    // Basic checks
    if (!loginField || !password) {
      return res.status(400).json({success: false,message: "Please fill in all sections."});
    }

    // Mongo query
    let query = {};
    if (email) {
      query.email = email;
    } else if (username) {
      query.username = username;
    } else if (identifier) {
      query.identifier = identifier;
      query = {$or: [{ email: identifier }, { username: identifier }]};
    }

    // Find user by email or username
    const user = await User.findOne(query);
    if (!user) {
      return res.status(400).json({ success: false, message: "Email / Username or Password incorrect." });
    }

    // Compare password with bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Email / Username or Password incorrect." });
    }

    // Remove password before sending to client
    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({success: true, data: userObj, message: "Success, Logged In!"});
  } catch (error) {
    console.log("Error in doLogin:", error.message);
    return res.status(500).json({ success: false, message: "Server Error during login." });
  }
}

// SIGN UP
export const doSignup = async (req, res) => {
    try {
        const { email, username, password, firstName, lastName, phone } = req.body;

        // Basic required field checks
        if (!email || !username || !password || !firstName || !lastName || !phone) {
            return res.status(400).json({ success: false, message: "Please fill in all sections." });
        }

        // Email regex (simple but stronger than just '@' + '.')
        const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: "Not a valid email. Please enter a valid email address." });
        }

        // Phone check: here using 10 digits; adjust if needed
        const phoneRegex = /^\+?\d{10}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ success: false, message: "Not a valid phone number. Please enter a 10-digit number." });
        }

        // Password length
        if (password.length < 8) {
            return res.status(400).json({success: false,message: "Password must be at least 8 characters long."});
        }

        // Check if email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ success: false, message: "Email already used." });
        }

        // Check if username already exists
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ success: false, message: "Username already used." });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const userData = {
            email,
            username,
            password: hashedPassword,
            firstName,
            lastName,
            phone
        };
        const newUser = new User(userData);
        await newUser.save();
        return res.status(200).json({ success: true, data: newUser, message: "User created." });
    } catch (error) {
        console.error("Error in doSignup:", error.message);
        return res.status(500).json({ success: false, message: "Server Error during signup." });
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

