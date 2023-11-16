import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import colors from "colors";
import {connectDb} from "./config/dbConnection.js";
import userRouter from "./Routes/UserRoutes.js";
import { errorHandler } from "./middleWares/errorMidddleWare.js";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

//connect db
connectDb();

// Main Route
app.get("/", (req, res) => {
    res.send("Api is Working...");
})

// Other Routes
app.use("/api/user", userRouter);

// ERROR HANDLING MIDDLEWARES
app.use(errorHandler);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`.bgBlue.white);
})