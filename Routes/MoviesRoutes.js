import express from "express";
import { isAdmin, requireSignIn } from "../middleWares/authMiddleWares.js";
import {
    createMovieController,
    createMovieReviewsController,
    deleteAllMoviesController,
    deleteMovieController,
    getMovieByIdController,
    getMoviesController,
    getRandomMovieController,
    getTopRatedMoviesController,
    importMoviesController,
    updateMovieController
} from "../Controllers/MoviesController.js";


const movieRouter = express.Router();


// ************ PUBLIC ROUTES ************ //
movieRouter.post("/import", importMoviesController)
movieRouter.get("/", getMoviesController)
movieRouter.get("/:id", getMovieByIdController)
movieRouter.get("/rated/top", getTopRatedMoviesController)
movieRouter.get("/random/all", getRandomMovieController)


// ************ PRIVATE ROUTES ************ //

movieRouter.post("/:id/reviews", requireSignIn, createMovieReviewsController)



// ************ ADMIN ROUTES ************ //
movieRouter.post("/", requireSignIn, isAdmin, createMovieController)
movieRouter.put("/:id", requireSignIn, isAdmin, updateMovieController)
movieRouter.delete("/:id", requireSignIn, isAdmin, deleteMovieController)
movieRouter.delete("/", requireSignIn, isAdmin, deleteAllMoviesController)



export default movieRouter;