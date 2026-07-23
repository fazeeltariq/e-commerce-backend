import express from "express";
import { registerUser, loginUser, logoutUser, getUserProfile, updateProfile, changePassword } from "../controllers/userController.js";
import protect  from '../middleware/authMiddleware.js';


const router = express.Router();


router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

export default router;

