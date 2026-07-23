import express from "express";

import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/roleMiddleware.js";
import validateObjectId from "../middleware/validateObjectId.js";

import { createOrder,  getMyOrders,  getOrderById,  getAllOrders,  updateOrderStatus } from "../controllers/orderController.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/:id", validateObjectId(), protect, getOrderById);
router.get("/", protect, adminOnly, getAllOrders);
router.put("/:id/status", validateObjectId(), protect,  adminOnly,  updateOrderStatus );



export default router;