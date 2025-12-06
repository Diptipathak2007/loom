"use server"
import path from "path";
import User from "../models/user.model";
import { connectDB } from "../mongoose";
import { revalidatePath } from "next/cache";
import { model } from "mongoose";
interface Params{
    userId:string;
    username:string;
    name:string;
    image?:string;
    bio?:string;
    path:string;
}

export async function updateUser({
    userId,
    username,
    name,
    image,
    bio,
    path,
}:Params):Promise<void>{

    try {
        await connectDB();
        await User.findOneAndUpdate(
            {id:userId},
            {
                id: userId,  // ⭐ CRITICAL: Must set id field for upsert
                username: username.toLowerCase(),
                name,
                image,
                bio,
                onboarded: true
            },
            {upsert:true}
        );
        if(path==='/profile/edit'){
            revalidatePath(path);
        }
    } catch (error) {
        throw new Error("Failed to update user");
    }
    
    
}

export async function fetchUser(userId:string){
    try {
        await connectDB();
        const user=await User.findOne({id:userId})
        // .populate(
        //     path:"communities",
        //     model:Community
        // );
        return user;
    } catch (error) {
        throw new Error("Failed to fetch user");
    }
}