"use server";

import Loom from "../models/loom.model";
import User from "../models/user.model";
import { connectDB } from "../mongoose";
import { revalidatePath } from "next/cache";

// ----------------------------------------------------
// Create New Loom (Thread)
// ----------------------------------------------------
interface CreateParams {
  text: string;
  author: string; // userId string
  communityId: string | null;
  path: string;
}

export async function createLoom({
  text,
  author,
  communityId,
  path,
}: CreateParams) {
  try {
    await connectDB();

    const created = await Loom.create({
      text,
      author,
      community: communityId,
    });

    await User.findByIdAndUpdate(author, {
      $push: { Loom: created._id },
    });

    revalidatePath(path);
  } catch (error) {
    console.error("Create Loom Error:", error);
    throw new Error("Failed to create Loom");
  }
}

// ----------------------------------------------------
// Fetch Posts (with Full JSON-Safe Conversion)
// ----------------------------------------------------
export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  await connectDB();

  const skipAmount = (pageNumber - 1) * pageSize;

  let posts: any[] = await Loom.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: -1 })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({
      path: "author",
      model: User,
      select: "_id name image",
    })
    .populate({
      path: "children",
      populate: {
        path: "author",
        model: User,
        select: "_id name image",
      },
    })
    .lean(); // ⚡ Converts Mongoose Docs → Plain JS Objects

  // ⚡ Ensure ALL ObjectId fields become strings (Required for Client Components)
  posts = posts.map((post) => ({
    ...post,
    _id: post._id.toString(),

    author: post.author
      ? {
          ...post.author,
          id: post.author._id.toString(),
          _id: undefined, // remove raw ObjectId
        }
      : null,

    community: post.community
      ? {
          ...post.community,
          id: post.community._id.toString(),
          _id: undefined,
        }
      : null,

    children: post.children?.map((child: { _id: { toString: () => any; }; author: { _id: { toString: () => any; }; }; }) => ({
      ...child,
      _id: child._id.toString(),
      author: child.author
        ? {
            ...child.author,
            id: child.author._id.toString(),
            _id: undefined,
          }
        : null,
    })),
  }));

  const totalPosts = await Loom.countDocuments({
    parentId: { $in: [null, undefined] },
  });

  const isNext = totalPosts > skipAmount + posts.length;

  return { posts, isNext };
}
