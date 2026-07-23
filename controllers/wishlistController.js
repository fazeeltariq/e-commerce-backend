import asyncHandler from "../utils/asyncHandler.js";
import { Wishlist } from "../models/wishlistModel.js";
import { Product } from "../models/productModel.js";

const getPopulatedWishlist = async (wishlistId) => {
    return Wishlist.findById(wishlistId).populate("products", "name price images stock");
};

export const addToWishlist = asyncHandler(async (req, res) => {

    const { productId } = req.body;

    if (!productId) {
        res.status(400);
        throw new Error("Product ID is required.");
    }

    const product = await Product.findById(productId);

    if (!product) {
        res.status(404);
        throw new Error("Product not found.");
    }

    let wishlist = await Wishlist.findOne({
        user: req.user.id,
    });

    if (!wishlist) {

        wishlist = await Wishlist.create({
            user: req.user.id,
            products: [productId],
        });

    } else {

        const alreadyExists = wishlist.products.some(product =>
            product.equals(productId)
        );

        if (alreadyExists) {
            res.status(400);
            throw new Error("Product already exists in wishlist.");
        }

        wishlist.products.push(productId);

        await wishlist.save();
    }

    const updatedWishlist = await getPopulatedWishlist(wishlist._id);

    res.status(200).json({
        message: "Product added to wishlist successfully.",
        wishlist: updatedWishlist,
    });

});



export const getWishlist = asyncHandler(async (req, res) => {

    const wishlist = await Wishlist.findOne({
        user: req.user.id,
    }).populate("products", "name price images stock");

    if (!wishlist) {
        return res.status(200).json({
            products: [],
        });
    }

    res.status(200).json(wishlist);

});



export const removeFromWishlist = asyncHandler(async (req, res) => {

    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({
        user: req.user.id,
    });

    if (!wishlist) {
        res.status(404);
        throw new Error("Wishlist not found.");
    }

    const exists = wishlist.products.some(product =>
        product.equals(productId)
    );

    if (!exists) {
        res.status(404);
        throw new Error("Product not found in wishlist.");
    }

    wishlist.products = wishlist.products.filter(
        product => !product.equals(productId)
    );

    await wishlist.save();

    const updatedWishlist = await getPopulatedWishlist(wishlist._id);

    res.status(200).json({
        message: "Product removed successfully.",
        wishlist: updatedWishlist,
    });

});