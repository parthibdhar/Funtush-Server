import mongoose from "mongoose";

export const connectDb = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI,{
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`.green.underline.bold);
    } catch (error) {
        console.log(`Error: ${error.message}`.red.underline.bold);
        process.exit(1);
    }
}