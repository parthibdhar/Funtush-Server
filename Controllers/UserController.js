import asyncHandler from "express-async-handler"
import User from "../Models/UserModel";

// @desc Register User
// @route POST /api/users/
// @access public

const registerUserController = asyncHandler(async (req, res) => {
    const { fullName, email, password, image } = req.body;

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

        // else create new user
        res.status(200).send({
            success: true,
            message: "User created successfully",
            fullName,
            email,
            password,
            image
        })
    } catch (error) {

    }
})