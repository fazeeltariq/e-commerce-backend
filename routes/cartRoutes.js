import express from "express";
import protect from "../middleware/authMiddleware.js";
import validateObjectId from "../middleware/validateObjectId.js";

import { addToCart, getCart, updateCartItem, removeFromCart, clearCart, } from "../controllers/cartController.js";

const router = express.Router();



router.get("/", protect, getCart);
router.post("/", protect, addToCart);
router.put( "/:productId" ,protect , validateObjectId("productId"),  updateCartItem );
router.delete(  "/:productId", protect, validateObjectId("productId"),  removeFromCart );
router.delete("/", protect, clearCart);



export default router;
