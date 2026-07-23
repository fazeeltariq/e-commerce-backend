import express from "express";
import protect  from '../middleware/authMiddleware.js'
import adminOnly from '../middleware/roleMiddleware.js'

import { createProduct, getProducts,   getProductById, updateProduct,deleteProduct, addReview } from "../controllers/productController.js";

import validateObjectId from "../middleware/validateObjectId.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();


router.post( "/", protect, adminOnly, upload.array("images", 5),  createProduct );

router.get("/", getProducts);

router.post("/:id/reviews", validateObjectId(), protect, addReview );

router.get("/:id", getProductById);

router.put( "/:id", protect, adminOnly, validateObjectId(), upload.array("images", 5),  updateProduct );

router.delete( "/:id", protect, adminOnly, validateObjectId(), deleteProduct);

export default router;


