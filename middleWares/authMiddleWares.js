import asyncHandler from "express-async-handler"
import jwt from "jsonwebtoken"
import UserModel from "../Models/UserModel.js";
// @desc Authenticated User & get TOken

export const generateToken = (id) => {
    return jwt.sign({ id },
        process.env.JWT_SECRET,
        { expiresIn: "1d" })
}

// ********** PROTECTED MIDDLEWARE ***********

export const requireSignIn = asyncHandler(async (req, res, next) => {
    let token;

    //check if token exist in headers
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {

        // set token from Bearer token in header
        try {
            token = req.headers.authorization.split(" ")[1];

            // verify token and get user id from token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            //get user id from token
            req.user = await UserModel.findById(decoded.id).select("-password");

            next();

        } catch (error) {
            console.log(error);
            res.status(401).send(
                {
                    success: false,
                    msg: "Not authorized, token failed",
                    error
                }
            )
            
        }
    }

    // if token not exist send error
    if(!token) {
        res.status(401).send(
            {
                success: false,
                msg: "Not authorized, no token"
            }
        )
    }

});


// ********** PROTECTED MIDDLEWARE ***********

export const isAdmin = asyncHandler(async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.user._id);

        if(user && user.isAdmin) {
            next();
        }
        else {
            res.status(401).send(
                {
                    success: false,
                    msg: "Not authorized as an admin"
                }
            )
        }
    } catch (error) {
        console.log(error);
        res.status(401).send(
            {
                success: false,
                msg: "Not authorized, token failed",
                error
            }
        )
    }
})
