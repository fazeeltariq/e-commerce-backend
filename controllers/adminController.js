import asyncHandler from "../utils/asyncHandler.js";

import { User } from "../models/userModel.js";
import { Product } from "../models/productModel.js";
import { Order } from "../models/orderModel.js";
import { Category } from "../models/categoryModel.js";

export const getDashboard = asyncHandler(async (req, res) => {

    const [
        totalUsers,
        totalProducts,
        totalCategories,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        revenue,
        recentOrders,
    ] = await Promise.all([

        User.countDocuments(),

        Product.countDocuments(),

        Category.countDocuments(),

        Order.countDocuments(),

        Order.countDocuments({
            status: "Pending",
        }),

        Order.countDocuments({
            status: "Delivered",
        }),

        Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: "$totalPrice",
                    },
                },
            },
        ]),

        Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("user", "name email"),

    ]);

    res.status(200).json({

        totalUsers,

        totalProducts,

        totalCategories,

        totalOrders,

        pendingOrders,

        deliveredOrders,

        totalRevenue: revenue[0]?.totalRevenue || 0,

        recentOrders,

    });

});