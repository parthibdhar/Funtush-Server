import { CategoriesData } from '../Data/CategoriesData.js';
import CategoriesModel from '../Models/CategoriesModel.js';
import asyncHandler from "express-async-handler";

//                                   // *********** PUBLIC CONTROLLERS ***********  //                                    //


// @desc Import Categories
// @route POST /api/categories/import
// @access public

export const importCategoriesController = asyncHandler(async (req, res) => {
    // first we make sure that our movie table is empty by deleting all documents
    await CategoriesModel.deleteMany({});

    // then we insert all movies from moviesData
    const categories = await CategoriesModel.insertMany(CategoriesData);

    res.status(201).send({
        success: true,
        message: "Categories imported successfully",
        categories
    })
});


// @desc Get All Categories
// @route POST /api/categories
// @access public

export const getAllCategoriesController = asyncHandler(async (req, res) => {

    try {
        const categories = await CategoriesModel.find();

    res.json(categories)
    } catch (error) {
        res.status(400).json({message: error.message})
    }
    
})

//                                   // *********** ADMIN CONTROLLERS ***********  //                                    //


// @desc create new Category
// @route POST /api/categories
// @access private/admin

export const createCategoryController = asyncHandler(async (req, res) => {
    try {
        const {title} = req.body;

        const newCategory = await CategoriesModel({title}).save();

        if(newCategory) {
            res.status(200).send({
                success: true,
                message: "Category created successfully",
                newCategory
            })
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Internal server error",
            error
        })
    }
})


// @desc update  Category
// @route put /api/categories
// @access private/admin

export const updateCategoryController = asyncHandler(async (req, res) => {
    try {
        const {title} = req.body;

        const cat = await CategoriesModel.findByIdAndUpdate(req.params.id, {title}, {new: true});

        res.status(200).send({
            success: true,
            message: "Category updated successfully",
            cat
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Internal server error",
            error
        })
    }
})


// @desc delete Category
// @route delete /api/categories
// @access private/admin

export const deleteCategoryController = asyncHandler(async (req, res) => {
    try {
        const delCat = await CategoriesModel.findByIdAndDelete(req.params.id);
        res.status(200).send({
            success: true,
            message: "Category deleted successfully",
            delCat
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "unable to delete Category",
            error
        })
    }
})
