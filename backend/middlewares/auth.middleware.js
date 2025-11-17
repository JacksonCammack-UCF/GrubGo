// backend/middlewares/auth.middleware.js
import { getAdminFromRequest } from "../utils/authHelpers.js";

export const verifyAdmin = async (req, res, next) => {
    try {
        const adminResult = await getAdminFromRequest(req);
        if (!adminResult.ok) {
            return res.status(adminResult.status).json({ success: false, message: adminResult.message });
        }
        req.admin = adminResult.admin;
        next();
    } catch (error) {
        console.error("Error in adminAuth middleware:", error.message);
        return res.status(500).json({ success: false, message: "Server error while authenticating admin." });
    }
};