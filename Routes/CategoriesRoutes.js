import express from "express";
import { isAdmin, requireSignIn } from "../middleWares/authMiddleWares.js";
import { createCategoryController, deleteCategoryController, getAllCategoriesController, importCategoriesController, updateCategoryController } from "../Controllers/CategoriesContoller.js";


const categoryRouter = express.Router();


// ************ PUBLIC ROUTES ************ //
categoryRouter.post("/import", importCategoriesController)
categoryRouter.get("/", getAllCategoriesController)

// ************ PRIVATE ROUTES ************ //




// ************ ADMIN ROUTES ************ //
categoryRouter.post("/", requireSignIn, isAdmin, createCategoryController)
categoryRouter.put("/:id", requireSignIn, isAdmin, updateCategoryController)
categoryRouter.delete("/:id", requireSignIn, isAdmin, deleteCategoryController)




export default categoryRouter;