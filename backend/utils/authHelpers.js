// backend/utils/authHelpers.js
import mongoose from "mongoose";
import User from  "../models/user.model.js";

export const getAdminFromRequest = async (req) => {
    const adminId = req.header("x-admin-id");

    if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
        return {ok: false, status: 401, message: "Invalid or missing admin ID in headers."};
    }

    const admin = await User.findById(adminId).select("isAdmin");

    if(!admin || !admin.isAdmin) {
        return {ok: false, status: 403, message: "Access denied. Admins only."};
    }
    return {ok: true, admin};
};
