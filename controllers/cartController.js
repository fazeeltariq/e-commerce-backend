import { Cart } from "../models/cartModel.js";
import { Product } from "../models/productModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";

// =====================
// Helper Functions
// =====================

const getValidProduct = async (productId, quantity) => {
    const product = await Product.findById(productId);

    if (!product) {
        const error = new Error("Product not found.");
        throw error;
    }

    if (quantity > product.stock) {
        const error = new Error("Not enough stock available.");
        throw error;
    }

    return product;
};


const getPopulatedCart = async (cartId) => {

    return Cart.findById(cartId).populate( "products.product", "name price images stock" );

};

// =====================
// Controllers
// =====================

export const addToCart = asyncHandler(async (req, res) => {

    const { productId } = req.body;
    const quantity = Number(req.body.quantity ?? 1);
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        res.status(400);
        throw new Error("Invalid product ID.");
    }
    
    if (!productId) {
        res.status(400);
        throw new Error("Product ID is required.");
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
        res.status(400);
        throw new Error("Quantity must be a positive integer.");
    }

   
    const product = await getValidProduct(productId, quantity);

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
        cart = new Cart({ user: userId, products: [] });
    }

    const existingItem = cart.products.find( (item) => item.product.equals(productId) );

    if (existingItem) {

        if (existingItem.quantity + quantity > product.stock) {
            res.status(400);
            throw new Error("Not enough stock available.");
        }

        existingItem.quantity += quantity;

    } else {

        cart.products.push({ product: productId, quantity, });

    }

    await cart.save();

    const updatedCart = await getPopulatedCart(cart._id);

    res.status(200).json({  message: "Product added to cart successfully.",  cart: updatedCart, });

});


export const getCart = asyncHandler ( async (req, res) => {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
        return res.status(200).json({ products: [], });
    }

    const populatedCart = await getPopulatedCart(cart._id);

    res.status(200).json(populatedCart);
});



export const updateCartItem = asyncHandler(async (req, res) => {

    const quantity = Number(req.body.quantity ?? 1);

    const { productId } = req.params;

    if (!Number.isInteger(quantity) || quantity <= 0) {
        res.status(400);
        throw new Error("Quantity must be a positive integer.");
    }

    await getValidProduct(productId, quantity);

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
        res.status(404);
        throw new Error("Cart not found.");
    }

    const cartItem = cart.products.find((item) => item.product.equals(productId) );

    if (!cartItem) {
        res.status(404);
        throw new Error("Product not found in cart.");
    }

    cartItem.quantity = quantity;

    await cart.save();

    const updatedCart = await getPopulatedCart(cart._id);

    res.status(200).json({ message: "Cart updated successfully.",  cart: updatedCart });

});


export const removeFromCart = asyncHandler(async (req, res) => {

    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        res.status(400);
        throw new Error("Invalid product ID.");
    }

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
        res.status(404);
        throw new Error("Cart not found.");
    }

    const cartItem = cart.products.find(
        (item) => item.product.equals(productId)
    );

    if (!cartItem) {
        res.status(404);
        throw new Error("Product not found in cart.");
    }

    cart.products = cart.products.filter(  (item) => !item.product.equals(productId) );

    await cart.save();

    const updatedCart = await getPopulatedCart(cart._id);

    res.status(200).json({
        message: "Product removed from cart.",
        cart: updatedCart,
    });

});


export const clearCart = asyncHandler(async (req, res) => {

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
        return res.status(200).json({ message: "Cart is already empty."  });
    }

    cart.products = [];

    await cart.save();

    res.status(200).json({ message: "Cart cleared successfully."  });
});