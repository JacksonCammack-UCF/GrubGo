import express from "express";
import { deleteUser, doLogin, doSignup, getUsers, updateCart } from "../controllers/user.controller.js";

const router = express.Router();

// GET USERS
router.get("/", getUsers);

// Delete user
router.delete("/:id", deleteUser);

// Login
router.post("/login", doLogin);

// Signup
router.post("/signup", doSignup);

// UPDATE CART
router.post("/cart/:id", updateCart);

export default router;
