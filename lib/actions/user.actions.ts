"use server"
import path from "path";
import User from "../models/user.model";
import { connectDB } from "../mongoose";
import { revalidatePath } from "next/cache";
import { model, SortOrder } from "mongoose";
import { FilterQuery } from "mongoose";
import Loom from "../models/loom.model";
import Notification from "../models/notification.model";
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

export async function fetchUsers({userId,pageNumber=1,sortBy="desc",pageSize=20,searchString=""}:{
    userId:string;
    pageNumber?:number;
    sortBy?:SortOrder;
    pageSize?:number;
    searchString?:string;
}){
    try {
        await connectDB();
        const skipAmount=(pageNumber-1)*pageSize;
        const regex=new RegExp(searchString,"i");
        const query:FilterQuery<typeof User>={
            id:{
                $ne:userId
            }
            
        }
        if(searchString.trim()!==""){
                query.$or=[
                    {username:{$regex:regex}},
                    {name:{$regex:regex}}
                ]
        }
        const sortOptions={
            createdAt:sortBy
        }
        const usersQuery=User.find(query)
            .sort(sortOptions)
            .skip(skipAmount)
            .limit(pageSize)
        const totalUsersCount=await User.countDocuments(query);
        const users = await usersQuery.exec();
        
        const plainUsers = users.map((user) => ({
            ...user.toObject(),
            _id: user._id.toString(),
        }));

        const isNext = totalUsersCount > skipAmount + users.length;
        return {
            users: plainUsers,
            isNext
        }
    } catch (error) {
        throw new Error("Failed to fetch users");
    }
}

export async function getActivity(userId: string) {
  try {
    await connectDB();

    // 1. Fetch replies to user's looms
    const userLooms = await Loom.find({ author: userId });
    const childLoomIds = userLooms.reduce((acc: any[], loom: any) => {
      return acc.concat(loom.children);
    }, []);

    const replies = await Loom.find({
      _id: { $in: childLoomIds },
      author: { $ne: userId },
    })
      .populate({
        path: "author",
        model: User,
        select: "name image _id",
      })
      .lean();

    // 2. Fetch like notifications
    const notifications = await Notification.find({ userId: userId })
      .populate({
        path: "sourceId",
        model: User,
        select: "name image _id",
      })
      .lean();

    // 3. Normalize and merge
    const activityReplies = replies.map((reply) => ({
      ...reply,
      author: {
        name: reply.author.name,
        image: reply.author.image,
        _id: reply.author._id,
      },
      type: "reply",
      parentId: reply.parentId, // Link to the parent post
      createdAt: reply.createdAt,
    }));

    const activityNotifications = notifications.map((notification) => ({
      _id: notification._id,
      author: {
        name: notification.sourceId.name,
        image: notification.sourceId.image,
        _id: notification.sourceId._id,
      },
      type: "like",
      parentId: notification.resourceId, // Link to the liked post
      createdAt: notification.createdAt,
    }));

    const activity = [...activityReplies, ...activityNotifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return activity;
  } catch (error: any) {
    throw new Error(`Failed to fetch activity: ${error.message}`);
  }
}