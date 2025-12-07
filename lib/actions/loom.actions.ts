"use server";

import Loom from "../models/loom.model";
import User from "../models/user.model";
import Community from "../models/community.model";
import Notification from "../models/notification.model";
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

    let communityIdObject = null;
    if (communityId) {
      const communityIdObjectResult = await Community.findOne({
        id: communityId,
      });

      if (communityIdObjectResult) {
        communityIdObject = communityIdObjectResult._id;
      }
    }

    const created = await Loom.create({
      text,
      author: user._id, // valid ObjectId
      community: communityIdObject,
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
      select: "_id id name image",
    })
    .populate({
      path: "community",
      model: Community,
    })
    .populate({
      path: "children",
      populate: {
        path: "author",
        model: User,
        select: "_id id name image",
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
          id: post.community.id,
          name: post.community.name,
          image: post.community.image,
          _id: post.community._id.toString(),
          createdBy: post.community.createdBy ? post.community.createdBy.toString() : undefined,
        }
      : null,

    createdAt: post.createdAt.toISOString(), // Convert Date to string
    likes: post.likes ? post.likes.map((id: any) => id.toString()) : [],
    children: post.children?.map(
      (child: { _id: { toString: () => string }; parentId?: any; community?: any; author?: any; createdAt: Date; likes?: any[] }) => ({
        ...child,
        _id: child._id.toString(),
        parentId: child.parentId ? child.parentId.toString() : null,
        community: child.community ? child.community.toString() : null,
        createdAt: child.createdAt ? new Date(child.createdAt).toISOString() : "", // Convert Date to string
        likes: child.likes ? child.likes.map((id: any) => id.toString()) : [],
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
        path: "community",
        model: Community,
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

    if (!loom) return null;

    // Manually serialize the loom object
    const serializedLoom = {
      ...loom,
      _id: (loom as any)._id.toString(),
      likes: (loom as any).likes ? (loom as any).likes.map((id: any) => id.toString()) : [],
      author: {
        ...(loom as any).author,
        _id: (loom as any).author._id.toString(),
      },
      community: (loom as any).community
        ? {
            id: (loom as any).community.id,
            name: (loom as any).community.name,
            image: (loom as any).community.image,
            _id: (loom as any).community._id.toString(),
            createdBy: (loom as any).community.createdBy?.toString(),
          }
        : null,
      createdAt: (loom as any).createdAt.toISOString(),
      children: (loom as any).children.map((child: any) => ({
        ...child,
        _id: child._id.toString(),
        parentId: child.parentId ? child.parentId.toString() : null,
        community: child.community ? child.community.toString() : null,
        createdAt: child.createdAt ? new Date(child.createdAt).toISOString() : "",
        likes: child.likes ? child.likes.map((id: any) => id.toString()) : [],
        author: {
          ...child.author,
          _id: child.author._id.toString(),
        },
      })),
    };

    return serializedLoom;
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
          populate:[
            {
              path:"community",
              model:Community,
              select:"name id image _id",
            },
            {
              path:"children",
              model:Loom,
              populate:{
                path:"author",
                model:User,
                select:"name image id",
              },
            }
          ]
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
          createdAt: loom.createdAt ? new Date(loom.createdAt).toISOString() : "",
          likes: loom.likes ? loom.likes.map((id: any) => id.toString()) : [],
          community: loom.community ? {
              id: loom.community.id,
              name: loom.community.name,
              image: loom.community.image,
              _id: loom.community._id?.toString(),
              createdBy: loom.community.createdBy?.toString(),
          } : null,
          children: loom.children?.map((child: any) => ({
            ...child,
            _id: child._id?.toString(),
            parentId: child.parentId ? child.parentId.toString() : null,
            community: child.community ? child.community.toString() : null,
            createdAt: child.createdAt ? new Date(child.createdAt).toISOString() : "",
            likes: child.likes ? child.likes.map((id: any) => id.toString()) : [],
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

async function fetchAllChildThreads(loomId: string): Promise<any[]> {
  const childThreads = await Loom.find({ parentId: loomId });

  const descendantThreads = [];
  for (const childThread of childThreads) {
    const descendants = await fetchAllChildThreads(childThread._id);
    descendantThreads.push(childThread, ...descendants);
  }

  return descendantThreads;
}

export async function deleteLoom(id: string, path: string): Promise<void> {
  try {
    await connectDB();

    // Find the thread to be deleted (the main thread)
    const mainThread = await Loom.findById(id).populate("author community");

    if (!mainThread) {
      throw new Error("Thread not found");
    }

    // Fetch all child threads and their descendants recursively
    const descendantThreads = await fetchAllChildThreads(id);

    // Get all descendant thread IDs including the main thread ID and child thread IDs
    const descendantThreadIds = [
      id,
      ...descendantThreads.map((thread) => thread._id),
    ];

    // Extract the authorIds and communityIds to update User and Community models respectively
    const uniqueAuthorIds = new Set(
      [
        ...descendantThreads.map((thread) => thread.author?._id?.toString()),
        mainThread.author?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    const uniqueCommunityIds = new Set(
      [
        ...descendantThreads.map((thread) => thread.community?._id?.toString()),
        mainThread.community?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    // Recursively delete child threads and their descendants
    await Loom.deleteMany({ _id: { $in: descendantThreadIds } });

    // Update User model
    await User.updateMany(
      { _id: { $in: Array.from(uniqueAuthorIds) } },
      { $pull: { Loom: { $in: descendantThreadIds } } }
    );

    // Update Community model
    await Community.updateMany(
      { _id: { $in: Array.from(uniqueCommunityIds) } },
      { $pull: { loom: { $in: descendantThreadIds } } }
    );

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to delete thread: ${error.message}`);
  }
}

export async function toggleLike(loomId: string, userId: string, path: string) {
  try {
    await connectDB();

    const loom = await Loom.findById(loomId);
    if (!loom) throw new Error("Loom not found");

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

   
    const isLiked = (loom.likes || []).some((id: any) => id.toString() === user._id.toString());

    if (isLiked) {
      await Loom.findByIdAndUpdate(loomId, { $pull: { likes: user._id } });
    } else {
      await Loom.findByIdAndUpdate(loomId, { $push: { likes: user._id } });

      // Create Notification if not liking own post
      if (loom.author.toString() !== user._id.toString()) {
        await Notification.create({
          userId: loom.author,
          sourceId: user._id,
          activityType: "like",
          resourceId: loom._id,
        });
      }
    }

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to toggle like: ${error.message}`);
  }
}