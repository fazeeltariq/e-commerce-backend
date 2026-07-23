import { Product } from "../models/productModel.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import validateObjectId from '../middleware/validateObjectId.js'
import { Category } from "../models/categoryModel.js";
import uploadToCloudinary from '../utils/uploadToCloudinary.js'
import deleteFromCloudinary from '../utils/deleteFromCloudinary.js'


export const createProduct = asyncHandler(async (req, res) => {

    const { name, description, price, stock, brand, category } = req.body;

    if ( !name?.trim() || !description?.trim() || price == null || price <= 0 || stock == null || stock < 0 || 
    !brand?.trim() || !category ) 
    {
        res.status(400);
        throw new Error("All required fields must be provided.");
    }

    const categoryExists = await Category.findById(category);

    if (!categoryExists) {
        res.status(404);
        throw new Error("Category not found.");
    }

    if (!req.files || req.files.length === 0) {
        res.status(400);
        throw new Error("At least one product image is required.");
    }

    const uploadedImages = await Promise.all(
        req.files.map(file => uploadToCloudinary(file.buffer))
    );


    const images = uploadedImages.map(image => ({
        url: image.secure_url,
        public_id: image.public_id,
    }));

    const product = await Product.create({
        name: name.trim(),
        description: description.trim(),
        price,
        stock,
        brand: brand.trim(),
        category,
        images,
    });

    res.status(201).json({ message: "Product created successfully", product  });
});



export const getProducts = asyncHandler(async (req, res) => {

    const allowedSortFields = ["price", "-price", "createdAt", "-createdAt", "name", "-name"];

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const search = req.query.search || "";
    const category = req.query.category || "";


    const sort = allowedSortFields.includes(req.query.sort) ? req.query.sort : "-createdAt";

    const skip = (page - 1) * limit;

    const filter = {};

    if (search) {
        filter.name = {
            $regex: search,
            $options: "i"
        };
    }

    if (category) {
        filter.category = category;
    }

    const products = await Product.find(filter).populate("category", "name").sort(sort).skip(skip).limit(limit);


    const totalProducts = await Product.countDocuments(filter);


    res.status(200).json({  products,  currentPage: page, totalPages: Math.ceil(totalProducts / limit), totalProducts });

});


export const getProductById = asyncHandler(async (req, res) => {

    const product = await Product.findById(req.params.id).populate("category", "name");;

    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    res.status(200).json(product);

});


export const updateProduct = asyncHandler(async (req, res) => {

    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error("Product not found.");
    }

    const { name, description, price, stock, brand, category,} = req.body;

    // Name
    if (name !== undefined) {

        if (!name.trim()) {
            res.status(400);
            throw new Error("Product name cannot be empty.");
        }

        product.name = name.trim();
    }

    // Description
    if (description !== undefined) {

        if (!description.trim()) {
            res.status(400);
            throw new Error("Description cannot be empty.");
        }

        product.description = description.trim();
    }

    // Price
    if (price !== undefined) {

        if (isNaN(price) || Number(price) <= 0) {
            res.status(400);
            throw new Error("Price must be greater than 0.");
        }

        product.price = Number(price);
    }

    // Stock
    if (stock !== undefined) {

        if (isNaN(stock) || Number(stock) < 0) {
            res.status(400);
            throw new Error("Stock cannot be negative.");
        }

        product.stock = Number(stock);
    }

    // Brand
    if (brand !== undefined) {

        if (!brand.trim()) {
            res.status(400);
            throw new Error("Brand cannot be empty.");
        }

        product.brand = brand.trim();
    }

    // Category
    if (category !== undefined) {

        if (!mongoose.Types.ObjectId.isValid(category)) {
            res.status(400);
            throw new Error("Invalid category ID.");
        }

        const categoryExists = await Category.findById(category);

        if (!categoryExists) {
            res.status(404);
            throw new Error("Category not found.");
        }

        product.category = category;
    }

    // Replace images if new ones are uploaded
    let oldImages = [];

if (req.files && req.files.length > 0) {

    oldImages = [...product.images];

    const uploadedImages = await Promise.all(
        req.files.map(file => uploadToCloudinary(file.buffer))
    );

    product.images = uploadedImages.map(image => ({
        url: image.secure_url,
        public_id: image.public_id,
    }));
}

const updatedProduct = await product.save();

if (oldImages.length > 0) {

    await Promise.all(
        oldImages.map(image =>
            deleteFromCloudinary(image.public_id)
        )
    );
}

res.status(200).json({
    message: "Product updated successfully.",
    product: updatedProduct,
});

});



export const deleteProduct = asyncHandler(async (req, res) => {

    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error("Product not found.");
    }

    // Delete all product images from Cloudinary
    await Promise.all(
        product.images.map(image =>
            deleteFromCloudinary(image.public_id)
        )
    );

    // Delete product from MongoDB
    await product.deleteOne();

    res.status(200).json({  message: "Product deleted successfully.", });

});


export const addReview = asyncHandler(async (req, res) => {

    const {  comment } = req.body;
    const rating = Number (req.body.rating);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        res.status(400);
        throw new Error("Rating must be between 1 and 5.");
    }

    if (!comment?.trim()) {
        res.status(400);
        throw new Error("Comment is required.");
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error("Product not found.");
    }

    const alreadyReviewed = product.reviews.find(review => review.user.toString() === req.user.id);

    if (alreadyReviewed) {
        res.status(400);
        throw new Error("You have already reviewed this product.");
    }

    const review = { user: req.user.id, username: req.user.name, rating, comment: comment.trim() };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    const totalRating = product.reviews.reduce((sum, review) =>
        sum + review.rating
        , 0);

    product.averageRating = totalRating / product.numReviews;

    await product.save();

    res.status(201).json({
        message: "Review added successfully.", reviews: product.reviews,
        averageRating: product.averageRating,
        numReviews: product.numReviews,
    });

});



// operate on specific document

// product.save();
// product.deleteOne();
// product.populate();
// product.validate();