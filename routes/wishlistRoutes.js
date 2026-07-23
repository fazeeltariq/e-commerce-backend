import express from "express";

import protect from "../middleware/authMiddleware.js";
import validateObjectId from "../middleware/validateObjectId.js";

import { addToWishlist, getWishlist, removeFromWishlist, } from "../controllers/wishlistController.js";

const router = express.Router();


router.get("/", protect, getWishlist);

router.post("/", protect, addToWishlist);

router.delete("/:productId", validateObjectId("productId"), protect, removeFromWishlist);

export default router;