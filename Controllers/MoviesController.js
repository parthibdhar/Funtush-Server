import { MoviesData } from '../Data/MoviesData.js';
import MoviesModel from '../Models/MoviesModel.js';
import asyncHandler from "express-async-handler";

//                                   // *********** PUBLIC CONTROLLERS ***********  //                                    //


// @desc Import Movies
// @route POST /api/movies/import
// @access public

export const importMoviesController = asyncHandler(async (req, res) => {
    // first we make sure that our movie table is empty by deleting all documents
    await MoviesModel.deleteMany({});

    // then we insert all movies from moviesData
    const movies = await MoviesModel.insertMany(MoviesData);

    res.status(201).send({
        success: true,
        message: "Movies imported successfully",
        movies
    })
});

// @desc Get All Movies
// @route POST /api/movies
// @access public

export const getMoviesController = asyncHandler(async (req, res) => {
    try {
        console.log("hi 0");

        // filter movies by category, time, language, rate, year & search
        const { category, time, language, rate, year, search } = req.query;
        let query = {
            ...(category && { category }),
            ...(time && { time }),
            ...(language && { language }),
            ...(rate && { rate }),
            ...(year && { year }),
            ...(search && { name: { $regex: search, $options: "i" } }),
        };

        // load more movies functionalities
        const page = Number(req.query.pageNumber) || 1; // if page number is not provided, set it to 1
        const limit = Number(req.query.limit) || 2; // 2 movies per page
        const skip = (page - 1) * limit; // skip 2 movies per page

        // find movies by query, skip and limit
        const movies = await MoviesModel.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        //get total number of movies
        const count = await MoviesModel.countDocuments(query);

        //send response with movies & total number of movies
        if (count == 0) {
            res.status(404).send({
                success: false,
                message: "Movies not found"
            })
        } else {
            res.status(200).send({
                success: true,
                message: "Movies fetched successfully",
                movies,
                page,
                pages: Math.ceil(count / limit), // total number of pages
                totalMovies: count // total number of movies
            })
        }



    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "error in get All Movies",
            error
        });
    }

});

// @desc Get  Movie by id
// @route POST /api/movies/:id
// @access public

export const getMovieByIdController = asyncHandler(async (req, res) => {
    try {
        const movie = await MoviesModel.findById(req.params.id);

        if (movie) {
            res.status(200).send({
                success: true,
                message: "Movie fetched successfully",
                movie
            })
        }
        else {
            res.status(404).send({
                success: false,
                message: "Movie not found"
            })
        }


    } catch (error) {
        res.status(500).send({
            success: false,
            message: "error in get Movie by id",
            error
        })
    }
});


// @desc Get  Top Rated Movies
// @route POST /api/movies/rated/top
// @access public

export const getTopRatedMoviesController = asyncHandler(async (req, res) => {
    try {
        const movies = await MoviesModel.find()
            .sort({ rate: -1 })
            .limit(10);
        res.status(200).send({
            success: true,
            message: "Top rated movies fetched successfully",
            movies
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "error in get Top Rated Movies",
            error
        })
    }
})

// @desc Get Random Movie 
// @route POST /api/movies/random/all
// @access public

export const getRandomMovieController = asyncHandler(async (req, res) => {
    try {
        // find random movies
        const movies = await MoviesModel.aggregate([{ $sample: { size: 8 } }]);

        // send random movies
        res.status(200).send({
            success: true,
            message: "Random movies fetched successfully",
            movies
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "error in get Random Movie",
            error
        })
    }
})



//                                   // *********** PRIVATE CONTROLLERS ***********  //                                    //

// @desc create Movie Reviews 
// @route POST /api/movies/:id/reviews
// @access private

export const createMovieReviewsController = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    console.log(req.user);
    console.log("hi 0");
    try {
        // find movie in the dataBase
        const movie = await MoviesModel.findById(req.params.id);
        console.log("hi 1");


        if (movie) {
            // check if user already reviewed the movie
            const alreadyReviewed = movie.reviews.find((r) => r.userId.toString() === req.user._id.toString());

            // if user already reviewed the movie send 400
            if (alreadyReviewed) {
                console.log("hi 3");
                throw new Error("Already reviewed");
            }
            else {
                console.log("hi 4");
                // else create a new review
                const review = {
                    userName: req.user.fullName,
                    userImage: req.user.image || "",
                    rating: Number(rating),
                    comment,
                    userId: req.user._id
                }

                // push review to reviews array
                movie.reviews.push(review);

                // increase number of reviews
                movie.numberOfReviews = movie.reviews.length;

                //calculate the new rating
                movie.rate = movie.reviews.reduce((acc, item) => item.rating + acc, 0) / movie.numberOfReviews;

                // save the movie in database
                await movie.save();

                // send the new movie to the client
                res.status(200).send({
                    success: true,
                    message: "Movie review created successfully",
                    movie
                })



            }

        } else {
            console.log("hi 4");

            res.status(404).send({
                success: false,
                message: "Movie not found"
            })
        }


    } catch (error) {
        console.log("hi bal");
        console.log(error);

        res.status(500).send({
            success: false,
            message: "error in create Movie Reviews",
            error
        })

    }
})

//                                   // *********** ADMIN CONTROLLERS ***********  //                                    //

// @desc create Movie  
// @route post /api/movies   
// @access private/admin

export const createMovieController = asyncHandler(async (req, res) => {

    try {
        //get data from request body
        const {
            name,
            desc,
            image,
            titleImage,
            rate,
            numberOfReviews,
            category,
            time,
            language,
            year,
            video,
            casts
        } = req.body;

        // create new movie

        const movie = await new MoviesModel({
            name,
            desc,
            image,
            titleImage,
            rate,
            numberOfReviews,
            category,
            time,
            language,
            year,
            video,
            casts,
            userId: req.user._id
        })

        // save movie in database
        if (movie) {
            const result = await movie.save();
            res.status(201).send({
                success: true,
                message: "Movie created successfully",
                result
            })
        }
        else {
            throw new error("Movie not created Invalid data");
        }

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "error in post Movie",
            error
        })
    }
})


// @desc update Movie  
// @route put /api/movies/:id   
// @access private/admin

export const updateMovieController = asyncHandler(async (req, res) => {

    try {

        //get data from request body
        const {
            name,
            desc,
            image,
            titleImage,
            rate,
            numberOfReviews,
            category,
            time,
            language,
            year,
            video,
            casts
        } = req.body;

        // find movie by  id
        const movie =  await MoviesModel.findById(req.params.id);
        console.log(movie);

        if (movie) {
            // update movie
            movie.name = name || movie.name;
            movie.desc = desc || movie.desc;
            movie.image = image || movie.image;
            movie.titleImage = titleImage || movie.titleImage;
            movie.rate = Number(rate) || movie.rate;
            movie.numberOfReviews = Number(numberOfReviews) || movie.numberOfReviews;
            movie.category = category || movie.category;
            movie.time = time || movie.time;
            movie.language = language || movie.language;
            movie.year = year || movie.year;
            movie.video = video || movie.video;
            movie.casts = casts || movie.casts;
            // Handle reviews.1.rating separately if needed
            if (movie.reviews && movie.reviews.length > 1) {
                movie.reviews[1].rating = !isNaN(parseFloat(reviews[1].rating)) ? parseFloat(reviews[1].rating) : movie.reviews[1].rating;
            }

            // save movie
            const updatedMovie = await movie.save();

            //send to the client 
            res.status(201).send({
                success: true,
                message: "Movie updated successfully",
                updatedMovie
            })
        }
        else {
            res.status(404).send({
                success: false,
                message: "Movie not found"
            })
        }

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "error in update Movie",
            error
        })
    }
})

// @desc delete Movie By Id 
// @route delete /api/movies/:id   
// @access private/admin

export const deleteMovieController = asyncHandler(async (req, res) => {
    try {
        const deletedmovie = await MoviesModel.findByIdAndDelete(req.params.id);
        if (deletedmovie) {
            res.status(200).send({
                success: true,
                message: "Movie deleted successfully",
                deletedmovie
            })
        }

        else {
            throw new Error("Movie not found");
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "error in delete Movie",
            error
        })
    }
})

// @desc delete all Movie  
// @route delete /api/movies/   
// @access private/admin

export const deleteAllMoviesController = asyncHandler(async (req, res) => {
    try {
        const deleteAllMovie = await MoviesModel.deleteMany({});
        res.status(200).send({
            success: true,
            message: "All Movies deleted successfully",
            deleteAllMovie
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "error in delete all Movies",
            error
        })
    }
})