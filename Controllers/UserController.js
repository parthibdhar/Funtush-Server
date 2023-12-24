import asyncHandler from "express-async-handler"
import UserModel from "../Models/UserModel.js";
import { comparePassword, hashPassword } from "../Helper/authHelper.js";
import { generateToken } from "../middleWares/authMiddleWares.js";


//                                   // *********** PUBLIC CONTROLLERS ***********  //                                    //


// @desc Register User
// @route POST /api/users/
// @access public

export const registerUserController = asyncHandler(async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
        const userExist = await UserModel.findOne({ email });

        //check if user exist
        if (userExist) {
            res.status(400).send(
                {
                    success: false,
                    message: "User already exist"
                }
            )
        }

        // hashing the password
        const hashedPassword = await hashPassword(password);

        // else create new user
        const user = await new UserModel({
            fullName,
            email,
            password: hashedPassword,

        }).save();

        res.status(200).send({
            success: true,
            message: "User created successfully",
            user
        })
    } catch (error) {
        res.status(500).send(
            {
                success: false,
                message: "Internal server error unablr to register user",
                error: error.message
            }
        )
    }
})

// @desc Login User
// @route POST /api/users/login
// @access public

export const loginUserController = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    console.log(email, password);
    try {
        const user = await UserModel.findOne({ email });

        //check if user exist
        if (!user) {
            res.status(404).send(
                {
                    success: false,
                    message: "User not found please register first"
                }
            )
        }

        //check password
        const match = await comparePassword(password, user.password);
        if (!match) {
            res.status(401).send(
                {
                    success: false,
                    message: "Invalid password please try again"
                }
            )
        }

        // if matched generate token
        const token = generateToken(user._id);

        res.status(200).send({
            success: true,
            message: "User logged in successfully",
            user,
            token
        })

    } catch (error) {
        res.status(500).send(
            {
                success: false,
                message: "Internal server error unablr to login user",
                error
            }
        )
    }
})


//                                   // *********** PRIVATE CONTROLLERS ***********  //                                   //


//  @desc Update User Profile
//  @route PUT /api/users/updateUser
//  @access private

export const updateUserProfileController = asyncHandler(async (req, res) => {
    const { fullName, email, image } = req.body;
    try {

        // find user
        const user = await UserModel.findById(req.user._id);

        // if user got update data and save it in db
        if (user) {
            user.fullName = fullName || user.fullName;
            user.email = email || user.email;
            user.image = image || user.image;
        }

        const updatedUser = await user.save();

        const token = generateToken(updatedUser._id);

        res.status(200).send({
            success: true,
            message: "User updated successfully",
            updatedUser,
            token
        })
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Internal server error unablr to update user",
            error
        })
    }
})

// @desc delete user profile
// @route DELETE /api/users/deleteUser
// @access private

export const deleteUserController = asyncHandler(async (req, res) => {
    try {
        const user = await UserModel.findById(req.user._id);

        // if user exist
        if (user) {
            //check if user is admin then throw an error
            if (user.isAdmin) {
                return res.status(400).send({
                    success: false,
                    message: "Admin cannot be deleted"
                })
            }
            else {
                const deleteUser = await UserModel.findByIdAndDelete(user._id);
                res.status(200).send({
                    success: true,
                    message: "User deleted successfully",
                    deleteUser
                })
            }
        }
        else {
            res.status(404).send({
                success: false,
                message: "User not found"
            })
        }

    }
    catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Internal server error unablr to delete user",
            error
        })
    }
})

// @desc change User Password
// @route PUT /api/users/changeUserPassword
// @access private

export const changePasswordController = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    try {
        // find user in db
        const user = await UserModel.findById(req.user._id).select("+password");
        // if user exist then compare old password with db password update and save it
        const oldPasswordMatch = await comparePassword(oldPassword, user.password);
        if (user && oldPasswordMatch) {
            // then hash new  password
            user.password = await hashPassword(newPassword);

            const update = await user.save();
            res.status(200).send({
                success: true,
                message: "Password changed successfully",
                update
            })
        }
        else {
            res.status(400).send({
                success: false,
                message: "Invalid old password"
            })
        }
    } catch (error) {

    }
});

// @desc get all Liked Movies
// @route GET /api/users/favorites
// @access private

export const getFavoritesMoviesController = asyncHandler(async (req, res) => {
    try {
        // user validation 
        const user = await UserModel.findById(req.user._id).populate("likedMovies");

        // if user then send liked movies to the client
        if (user) {
            res.status(200).send({
                success: true,
                likedMovies: user.likedMovies
            })
        }
        else {
            res.status(404).send({
                success: false,
                message: "User not found"
            })
        }


    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Internal server error unablr to get liked movies",
            error
        })
    }
})

// @desc add movie to favorites to like
// @route POST /api/users/addFavorites
// @access private

export const addFavoriteMovieController = asyncHandler(async (req, res) => {
    const { movieId } = req.body;

    try {
        // find user in db
        const user = await UserModel.findById(req.user._id);

        if (user) {

            // checked if movie is already liked
            // if movie id liked send error
            if (user.likedMovies.includes(movieId)) {
                return res.status(400).send({
                    success: false,
                    message: "Movie already liked"
                })
            }

            //else add movies to liked movies and sace  it
            user.likedMovies.push(movieId);

            const result = await user.save();
            console.log(result);

            res.status(200).send({
                success: true,
                message: "Movie liked successfully",
                result: result.likedMovies
            })
        }

        else {
            res.status(404).send({
                success: false,
                message: "Movies not found"
            })
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Internal server error unablr to add movie to favorites",
            error
        })
    }
})

// @desc remove all movies from favorites
// @route DELETE /api/users/deleteAllFavorites
// @access private

export const deleteAllFavoriteMoviesController = asyncHandler(async (req, res) => {
    try {
        // find user in db
        const user = await UserModel.findById(req.user._id);

        // if user then delete all liked movies
        if (user) {
            user.likedMovies = [];
            const result = await user.save();
            res.status(200).send({
                success: true,
                message: "All your favourite movies deleted successfully",
                result
            })
        }

        // else send error
        else {
            res.status(404).send({
                success: false,
                message: "User not found"
            })
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Internal server error unablr to delete all movies",
            error
        })
    }

});


//                                   // *********** ADMIN CONTROLLERS ***********  //                                    //


// @desc get all users
// @route GET /api/users/getAllUsers
// @access private/Admin 

export const getAllUserController = asyncHandler(async (req, res) => {
    try {

        // find all users in db
        const users = await UserModel.find({});

        // if got users then send it
        res.status(200).send({
            success: true,
            msg: `Got ${users.length} users`,
            users
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Internal server error",
            error
        })
    }
});

// @desc delete user
// @route DELETE /api/users/deleteUser/:id
// @access private/Admin

export const deleteUserByAdminController = asyncHandler(async (req, res) => {
    try {

        // find user by id
        const user = await UserModel.findById(req.params.id);

        // if user exist then delete
        if (user) {
            // if user is admin then send error
            if (user.isAdmin) {
                return res.status(400).send({
                    success: false,
                    message: "Admin cannot be deleted"
                })
            }
            else {
                const deleteUser = await UserModel.findByIdAndDelete(user._id);
                res.status(200).send({
                    success: true,
                    message: "User deleted successfully",
                    deleteUser
                })
            }
        }

    } catch (error) {
        
    }
})