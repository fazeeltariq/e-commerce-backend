import { Category } from "../models/categoryModel.js";
import asyncHandler from "../utils/asyncHandler.js";


export const createCategory = asyncHandler(async (req, res) => {

    const { name } = req.body;

    if (!name?.trim()) {
        res.status(400);
        throw new Error("Category name is required");
    }

    const exists = await Category.findOne({
        name: name.trim()
    });

    if (exists) {
        res.status(400);
        throw new Error("Category already exists");
    }

    const category = await Category.create({  name: name.trim() });

    res.status(201).json(category);

});


export const getCategories = asyncHandler(async (req, res) => {

    const categories = await Category.find().sort("name");

    res.status(200).json(categories);

});



export const updateCategory = asyncHandler(async (req, res) => {

    const category = await Category.findById(req.params.id);

    if (!category) {
        res.status(404);
        throw new Error("Category not found.");
    }

    const { name } = req.body;

    if (name !== undefined) {

        const normalizedName = name.trim();

        if (!normalizedName) {
            res.status(400);
            throw new Error("Category name cannot be empty.");
        }

        if (normalizedName !== category.name) {

            const existingCategory = await Category.findOne({ name: normalizedName,  _id: { $ne: category._id }, });

            if (existingCategory) {
                res.status(400);
                throw new Error("Category already exists.");
            }
        }

        category.name = normalizedName;
    }

    const updatedCategory = await category.save();

    res.status(200).json({
        message: "Category updated successfully.",
        category: updatedCategory,
    });

});



export const deleteCategory = asyncHandler(async (req, res) => {

    const category = await Category.findById(req.params.id);

    if (!category) {
        res.status(404);
        throw new Error("Category not found");
    }

    await category.deleteOne();

    res.status(200).json({
        message: "Category deleted successfully"
    });

});