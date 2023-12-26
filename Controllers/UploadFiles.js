import express from "express";
import multer from "multer";
import path from "path";
import {v4 as uuidv4} from "uuid";
import storage from "../config/fireBaseConfig.js";
import { log } from "console";
import asyncHandler from "express-async-handler";

const UploadRouter = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
});

UploadRouter.post("/", upload.single("file"), asyncHandler(async (req, res) => {
    try {

        // get file from request
        const file = req.file;
        
        // create new file name
        if(file) {
            const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
            const blob = storage.file(fileName);
            const blobStream = blob.createWriteStream({
                resumable: false,
                metadata: {
                    contentType: file.mimetype,
                }
            });


            // if error
            blobStream.on("error", (error) => {
                log(error);
                res.status(400).send({
                    success: false,
                    msg: "Something went wrong",
                    error
                })
            });
            

            //if success
            blobStream.on("finish", async () => {

                //get the public url
                 const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${storage.name}/o/${fileName}?alt=media`;

                 //return the file name and public url
                 res.status(200).send({
                     success: true,
                     msg: "File uploaded successfully",
                     fileName,
                     fileUrl: publicUrl
                 })
            })
            blobStream.end(file.buffer);
        }

        // when there is no file
        else {
            res.status(400).send({
                success: false,
                msg: "No file found please upload a file"
            })
        }

        
    } catch (error) {
        log(error);
        res.status(400).send({
            success: false,
            msg: "Something went wrong",
            error
        })
    }
}))

export default UploadRouter;