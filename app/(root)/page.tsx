"use Client"
import { currentUser } from "@clerk/nextjs/server";
import User from "@/lib/models/user.model";
import { connectDB } from "@/lib/mongoose";
import { redirect } from "next/navigation";
import { fetchPosts } from "@/lib/actions/loom.actions";

export default async function Home() {
  await connectDB();

  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const dbUser = await User.findOne({ id: clerkUser.id });

  // If user not onboarded → push to onboarding
  if (!dbUser?.onboarded) redirect("/onboarding");
  const result=await fetchPosts(1,30);
  console.log("Fetched Posts:",result);

  return (
    <>
    <h1 className="head-text text-left">HOME</h1>
    <section className="mt-9 flex flex-col gap-10">
      {result.posts.length===0?(
        <p>No posts available</p>
      ):(
        {result.posts.map((post)=>(
          
        ))}
      )}
    </section>
    </>
  );
}

