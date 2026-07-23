import express from "express";

import protect  from '../middleware/authMiddleware.js'

import adminOnly from '../middleware/roleMiddleware.js'


import {  getDashboard } from "../controllers/adminController.js";


const router = express.Router();

// Admin Dashboard Statistics
router.get("/dashboard/stats", protect, adminOnly, getDashboard );


export default router;