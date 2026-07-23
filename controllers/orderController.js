import { Order } from "../models/orderModel.js";
import { Cart } from "../models/cartModel.js";
import { Product } from "../models/productModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";


// export const createOrder = async (req, res, next) => {

//     const session = await mongoose.startSession();

//     try {

//         session.startTransaction();

//         const cart = await Cart.findOne({ user: req.user.id })
//             .populate("products.product")
//             .session(session);

//         if (!cart || cart.products.length === 0) {
//             res.status(400);
//             throw new Error("Cart is empty.");
//         }

//         let totalPrice = 0;
//         const orderItems = [];

//         // Validate all products
       
//         for (const item of cart.products) {

//             const product = item.product;

//             if (!product) {
//                 res.status(404);
//                 throw new Error("Product not found.");
//             }

//             if (product.stock < item.quantity) {
//                 res.status(400);
//                 throw new Error(`${product.name} is out of stock.`);
//             }
//         }
//         // Build order + reduce stock

//         for (const item of cart.products) {

//             const product = item.product;

//             orderItems.push({
//                 product: product._id,
//                 quantity: item.quantity,
//                 price: product.price,
//             });

//             totalPrice += product.price * item.quantity;

//             product.stock -= item.quantity;
//         }

//         // Save all updated products

//         await Promise.all(
//             cart.products.map((item) =>
//                 item.product.save({ session })
//             )
//         );
//         // Create order

//         const [order] = await Order.create(
//             [{
//                 user: req.user.id,
//                 orderItems,
//                 totalPrice,
//             }],
//             { session }
//         );

//         // Clear cart
//         cart.products = [];

//         await cart.save({ session });

//         // Commit transaction

//         await session.commitTransaction();

//         res.status(201).json({
//             message: "Order placed successfully.",
//             order,
//         });

//     } catch (error) {

//         await session.abortTransaction();

//         next(error);

//     } finally {

//         session.endSession();

//     }

// };

export const createOrder = async (req, res, next) => {

    try {

        const cart = await Cart.findOne({ user: req.user.id })
            .populate("products.product");


        if (!cart || cart.products.length === 0) {
            res.status(400);
            throw new Error("Cart is empty.");
        }


        let totalPrice = 0;
        const orderItems = [];


        // Validate all products first
        for (const item of cart.products) {

            const product = item.product;

            if (!product) {
                res.status(404);
                throw new Error("Product not found.");
            }

            if (product.stock < item.quantity) {
                res.status(400);
                throw new Error(`${product.name} is out of stock.`);
            }
        }


        // Build order and reduce stock
        for (const item of cart.products) {

            const product = item.product;

            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                price: product.price,
            });


            totalPrice += product.price * item.quantity;


            product.stock -= item.quantity;
        }


        // Save updated products
        await Promise.all(
            cart.products.map(item =>
                item.product.save()
            )
        );


        // Create order
        const order = await Order.create({
            user: req.user.id,
            orderItems,
            totalPrice,
        });


        // Clear cart
        cart.products = [];

        await cart.save();


        res.status(201).json({
            message: "Order placed successfully.",
            order,
        });


    } catch (error) {

        next(error);

    }

};

export const getMyOrders = asyncHandler(async (req, res) => {

    const orders = await Order.find({  user: req.user.id })
    .populate("orderItems.product", "name images")
    .sort("-createdAt");


    res.status(200).json(orders);
});



export const getOrderById = asyncHandler(async (req, res) => {

    const order = await Order.findById(req.params.id)
        .populate("orderItems.product", "name images")
        .populate("user", "name email");

    if (!order) {
        res.status(404);
        throw new Error("Order not found.");
    }

    if (
        order.user._id.toString() !== req.user.id &&
        req.user.role !== "admin"
    ) {
        res.status(403);
        throw new Error("Access denied.");
    }

    res.status(200).json(order);

});


export const getAllOrders = asyncHandler(async (req, res) => {

    const orders = await Order.find()
        .populate("user", "name email")
        .populate("orderItems.product", "name")
        .sort("-createdAt");

    res.status(200).json(orders);

});




export const updateOrderStatus = asyncHandler(async (req, res) => {

    const { status } = req.body;

    const allowedStatus = [ "Pending", "Confirmed", "Shipped", "Delivered", "Cancelled" ];

    if (!allowedStatus.includes(status)) {
        res.status(400);
        throw new Error("Invalid order status.");
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error("Order not found.");
    }

    if (order.status === status) {
        res.status(400);
        throw new Error(`Order is already ${status}.`);
    }

    const validTransitions = {
        Pending: ["Confirmed", "Cancelled"],
        Confirmed: ["Shipped", "Cancelled"],
        Shipped: ["Delivered"],
        Delivered: [],
        Cancelled: [],
    };

    if (!validTransitions[order.status].includes(status)) {
        res.status(400);
        throw new Error(
            `Cannot change status from ${order.status} to ${status}.`
        );
    }

    order.status = status;

    await order.save();

    res.status(200).json({  message: "Order status updated.",  order });

});