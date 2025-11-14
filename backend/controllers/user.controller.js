// backend/controllers/user.controller.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import { sendOTPVerificationEmail } from "./auth.controller.js";

// GET USERS
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.log("error in fetching the users: ", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// DELETE USER
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Invalid user ID!" });
  }

  try {
    await User.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "User deleted!" });
  } catch (error) {
    console.log("error in deleting user:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// SIGN UP
export const doSignup = async (req, res) => {
  try {
    let { email, username, password, firstName, lastName, phone } = req.body;

    email = (email || "").trim();
    username = (username || "").trim();
    password = (password || "").trim();
    firstName = (firstName || "").trim();
    lastName = (lastName || "").trim();
    phone = (phone || "").trim();

    if (!email || !username || !password || !firstName || !lastName || !phone) {
      return res.status(400).json({ success: false, message: "Please fill in all sections." });
    }

    // Simple validations (can tweak)
    if (!/^\+?\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: "Invalid phone number format. Please enter at least 10 digits." });
    }

    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      return res.status(400).json({ success: false, message: "Not a valid email." });
    }

    if (password.length < 8) {
      return res
        .status(400).json({success: false,message: "Password must be at least 8 characters long."});
    }

    // Uniqueness checks
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({ success: false, message: "Email already used." });
    }

    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      return res.status(400).json({ success: false, message: "Username already used." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      points: 0,
      cart: [],
      isEmailVerified: false,
    });

    const savedUser = await newUser.save();

    // Send email verification OTP
    const emailData = await sendOTPVerificationEmail({
      _id: savedUser._id,
      email: savedUser.email,
      purpose: "EMAIL_VERIFICATION",
    });

    return res.status(200).json({
      success: true,
      status: "PENDING",
      message: "User created successfully! OTP email sent for verification.",
      data: emailData,
    });
  } catch (error) {
    console.error("Error in doSignup:", error.message);
    return res.status(500).json({ success: false, message: "Server Error during signup." });
  }
};

// LOGIN (email OR username OR identifier) + 2FA OTP
export const doLogin = async (req, res) => {
  try {
    const { email, username, identifier, password } = req.body;
    
    // Allow login with email, username, or generic "identifier"
    const loginField = email || username || identifier;

    if (!loginField || !password) {
      return res.status(400).json({ success: false, message: "Please fill in all sections." });
    }

    let query = {};
    if (email) {
      query.email = email;
    } else if (username) {
      query.username = username;
    } else if (identifier) {
      query.$or = [{ email: identifier }, { username: identifier }];
    }

    const user = await User.findOne(query);
    if (!user) {
        return res.status(400).json({ success: false, message: "Email / Password incorrect." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Email / Password incorrect." });
    }

    if (!user.isEmailVerified) {
      const emailData = await sendOTPVerificationEmail({
        _id: user._id,
        email: user.email,
        purpose: "EMAIL_VERIFICATION",
      });

      return res.status(200).json({ 
        success: true, 
        status: "PENDING", message: "Email not verified. A new verification code has been sent to your email.", 
        data: emailData 
      });
    }

    // Send 2FA OTP
    const emailData = await sendOTPVerificationEmail({
      _id: user._id,
      email: user.email,
      purpose: "TWO_FACTOR_AUTH",
    });

    return res.status(200).json({
      success: true,
      status: "PENDING",
      message: "Credentials valid. 2FA OTP sent to email.",
      data: emailData,
    });
  } catch (error) {
    console.log("Error in doLogin:", error.message);
    return res.status(500).json({ success: false, message: "Server Error during login." });
  }
};
