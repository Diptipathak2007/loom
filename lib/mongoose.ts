import mongoose from "mongoose";

let isConnected = false; // Track the connection status

export const connectDB=async()=>{
    mongoose.set('strictQuery', true);
    if(!process.env.MONGODB_URI){
        throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
    }
    if(isConnected){
        console.log("MongoDB is already connected");
        return;
    }
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        isConnected=true;
        console.log("MongoDB connected successfully");
    }catch(error){
        console.log("MongoDB connection error:",error);
        throw error;
    }
}