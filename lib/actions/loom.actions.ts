"use server";

import Loom from "../models/loom.model";
import User from "../models/user.model";
import { connectDB } from "../mongoose";
import { revalidatePath } from "next/cache";

// ----------------------------------------------------
// Types
// ----------------------------------------------------
interface CreateParams {
  text: string;
  // Clerk user id, e.g. "user_34uaZbO6GYyCYJLsotnGuppa4QI"
  clerkUserId: string;
  communityId: string | null;
  path: string;
}

interface FetchPostsResult {
  posts: any[];
  isNext: boolean;
}

// ----------------------------------------------------
// Create New Loom (Thread)
// ----------------------------------------------------
export async function createLoom({
  text,
  clerkUserId,
  communityId,
  path,
}: CreateParams) {
  try {
    await connectDB();

    // Resolve Clerk id -> Mongo User (with ObjectId _id)
    const user = await User.findOne({ id: clerkUserId });
    if (!user) {
      throw new Error("User not found for given clerkUserId");
    }

    const created = await Loom.create({
      text,
      author: user._id, // valid ObjectId
      community: communityId,
    });

    await User.findByIdAndUpdate(user._id, {
      $push: { Loom: created._id },
    });

    revalidatePath(path);
  } catch (error) {
    console.error("Create Loom Error:", error);
    throw new Error("Failed to create Loom");
  }
}

// ----------------------------------------------------
// Fetch Posts (with JSON-safe conversion)
// ----------------------------------------------------
export async function fetchPosts(
  pageNumber = 1,
  pageSize = 20
): Promise<FetchPostsResult> {
  await connectDB();

  const skipAmount = (pageNumber - 1) * pageSize;

  let posts: any[] = await Loom.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: -1 })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({
      path: "author",
      model: User,
      select: "_id id name image",   // ⭐ IMPORTANT - Use 'id' field
    })
    .populate({
      path: "children",
      populate: {
        path: "author",
        model: User,
        select: "_id id name image",  // ⭐ IMPORTANT - Use 'id' field
      },
    })
    .lean();

  posts = posts.map((post) => ({
    ...post,
    _id: post._id.toString(),

    author: post.author
      ? {
          ...post.author,
          id: post.author.id, // ⭐ USE ID FIELD FROM USER MODEL
          _id: undefined,
        }
      : null,

    community: post.community
      ? {
          ...post.community,
          id: post.community._id.toString(),
          _id: undefined,
        }
      : null,

    children: post.children?.map(
      (child: { _id: { toString: () => string }; author?: any }) => ({
        ...child,
        _id: child._id.toString(),
        author: child.author
          ? {
              ...child.author,
              id: child.author.id,  // ⭐ USE ID FIELD FROM USER MODEL
              _id: undefined,
            }
          : null,
      })
    ),
  }));

  const totalPosts = await Loom.countDocuments({
    parentId: { $in: [null, undefined] },
  });

  const isNext = totalPosts > skipAmount + posts.length;

  return { posts, isNext };
}

// ----------------------------------------------------
// Fetch Loom by ID (with population)
// ----------------------------------------------------
export async function fetchLoomById(loomId: string) {
  await connectDB();

  try {
    const loom = await Loom.findById(loomId)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      })
      .populate({
        path: "children",
        populate: [
          {
            path: "author",
            model: User,
            select: "_id id name parentId image",
          },
          {
            path: "children",
            model: Loom,
            populate: {
              path: "author",
              model: User,
              select: "_id id name parentId image",
            },
          },
        ],
      })
      .lean();

    return loom;
  } catch (err) {
    console.error("Error while fetching loom:", err);
    throw new Error("Unable to fetch loom by ID");
  }
}

// ----------------------------------------------------
// Add Comment to Loom
// ----------------------------------------------------
export async function addCommentToLoom(
  loomId: string,
  commentText: string,
  clerkUserId: string,
  path: string
) {
  await connectDB();

  try {
    const originalLoom = await Loom.findById(loomId);
    if (!originalLoom) {
      throw new Error("Loom not found");
    }

    // Resolve Clerk id -> Mongo User
    const user = await User.findOne({ id: clerkUserId });
    if (!user) {
      throw new Error("User not found for given clerkUserId");
    }

    const commentLoom = new Loom({
      text: commentText,
      author: user._id, // ObjectId, matches schema
      parentId: loomId,
    });

    const savedCommentLoom = await commentLoom.save();

    originalLoom.children.push(savedCommentLoom._id);
    await originalLoom.save();

    revalidatePath(path);
  } catch (err) {
    console.error("Error while adding comment:", err);
    throw new Error("Unable to add comment");
  }
}


export async function fetchUserPosts(userId:string){
    try {
      await connectDB();
      //find all the threads authored by the user
      const threads: any = await User.findOne({id:userId})
        .populate({
          path:"Loom",
          model:Loom,
          populate:{
            path:"children",
            model:Loom,
            populate:{
              path:"author",
              model:User,
              select:"name image id",
            },
          },
        })
        .lean();
      
      if (!threads) return null;

      // Convert MongoDB documents to plain objects
      return {
        ...threads,
        _id: threads._id?.toString(),
        Loom: threads.Loom?.map((loom: any) => ({
          ...loom,
          _id: loom._id?.toString(),
          children: loom.children?.map((child: any) => ({
            ...child,
            _id: child._id?.toString(),
            author: child.author ? {
              ...child.author,
              _id: child.author._id?.toString(),
            } : null,
          })),
        })) || [],
      };
    } catch (error) {
        throw new Error("Unable to fetch user posts");
    }
}