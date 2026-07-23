import express from "express";
import {  createCategory, getCategories,  updateCategory,  deleteCategory } from "../controllers/categoryController.js";

import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/roleMiddleware.js";
import validateObjectId from "../middleware/validateObjectId.js";

const router = express.Router();

router.get("/", getCategories);
router.post("/" , protect, adminOnly, createCategory);
router.put("/:id",  validateObjectId (), protect, adminOnly, updateCategory);
router.delete("/:id",  validateObjectId () , protect, adminOnly, deleteCategory);



export default router;