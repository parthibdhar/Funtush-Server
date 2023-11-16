import express from "express";
import {
    addFavoriteMovieController,
    changePasswordController,
    deleteAllFavoriteMoviesController,
    deleteUserByAdminController,
    deleteUserController,
    getAllUserController,
    getFavoritesMoviesController,
    loginUserController,
    registerUserController,
    updateUserProfileController
} from "../Controllers/UserController.js";
import { isAdmin, requireSignIn } from "../middleWares/authMiddleWares.js";

const userRouter = express.Router();


// ************ PUBLIC ROUTES ************ //

userRouter.post("/register", registerUserController);
userRouter.post("/login", loginUserController);


// ************ PRIVATE ROUTES ************ //

userRouter.put("/updateUser", requireSignIn, updateUserProfileController);
userRouter.delete("/deleteUser", requireSignIn, deleteUserController);
userRouter.put("/changeUserPassword", requireSignIn, changePasswordController);
userRouter.get("/favorites", requireSignIn, getFavoritesMoviesController);
userRouter.post("/addFavorites", requireSignIn, addFavoriteMovieController);
userRouter.delete("/deleteAllFavorites", requireSignIn, deleteAllFavoriteMoviesController);


// ************ ADMIN ROUTES ************ //
userRouter.get("/getAllUsers", requireSignIn, isAdmin, getAllUserController);
userRouter.delete("/deleteUser/:id", requireSignIn, isAdmin, deleteUserByAdminController);


export default userRouter;