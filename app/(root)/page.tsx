import { currentUser } from "@clerk/nextjs/server";
import User from "@/lib/models/user.model";
import { connectDB } from "@/lib/mongoose";
import { redirect } from "next/navigation";
import { fetchPosts } from "@/lib/actions/loom.actions";
import LoomCard from "@/components/cards/LoomCard";

export default async function Home() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  await connectDB();
  const dbUser = await User.findOne({ id: user.id });

  // If user not onboarded → push to onboarding
  if (!dbUser?.onboarded) redirect("/onboarding");

  const result = await fetchPosts(1, 30);
  console.log("Fetched Posts:", result);

  return (
    <>
      <h1 className="head-text text-left">HOME</h1>
      <section className="mt-9 flex flex-col gap-10">
        {result.posts.length === 0 ? (
          <p className="no-result">No posts available</p>
        ) : (
          <>
            {result.posts.map((post: any) => (
              <LoomCard
                key={post._id}
                id={post._id}
                currentUserId={user?.id}
                parentId={post.parentId}
                content={post.content}
                author={post.author}
                community={post.community}
                createdAt={post.createdAt}
                comments={post.children}
              />
            ))}
          </>
        )}
      </section>
    </>
  );
}
