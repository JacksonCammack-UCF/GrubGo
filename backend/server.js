import express from "express";
import cors from "cors";
import foodRoutes from "./routes/food.route.js";
import userRoutes from "./routes/user.route.js";
import orderRoutes from "./routes/order.route.js";
import { connectDB } from "./config/db.js";


const app = express();
app.use(cors());

app.use(express.json()); // allows us to accept json data in body, PARSE!

// Modify Users
app.use("/api/users", userRoutes);

// Call the Admin change products ITS ALL UNDER ROUTE
app.use("/api/foods", foodRoutes);

// Modify Orders
app.use("/api/orders", orderRoutes);

app.listen(5050, ()=>{
    connectDB();
    console.log("Server started at https://localhost/5050");
});