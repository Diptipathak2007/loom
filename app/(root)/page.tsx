import { currentUser } from "@clerk/nextjs/server";
import User from "@/lib/models/user.model";
import { connectDB } from "@/lib/mongoose";
import { redirect } from "next/navigation";

export default async function Home() {
  await connectDB();

  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const dbUser = await User.findOne({ id: clerkUser.id });

  // If user not onboarded → push to onboarding
  if (!dbUser?.onboarded) redirect("/onboarding");

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-5xl font-bold">
        Welcome, {dbUser.name || clerkUser.firstName} 👋
      </h1>
    </div>
  );
}

