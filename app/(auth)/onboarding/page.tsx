import AccountProfile from "@/components/forms/AccountProfile";
import { currentUser } from "@clerk/nextjs/server";
import { fetchUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";

async function Page() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // Fetch existing user info from database
  const userInfo = await fetchUser(user.id);

  // If already onboarded, redirect to home
  if (userInfo?.onboarded) redirect("/");

  const userData = {
    id: user?.id,
    objectId: userInfo?._id,
    username: userInfo?.username || user?.username || "",
    name: userInfo?.name || user?.firstName || "",
    bio: userInfo?.bio || "",
    image:
      userInfo?.image ? userInfo.image : user?.imageUrl || "/assets/profile.svg",
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black text-white">
      {/* 🔮 Background glows */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-800/30 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] bg-fuchsia-600/20 rounded-full blur-[180px] animate-ping"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-purple-900/20 to-transparent rounded-full blur-[250px] opacity-50"></div>
      </div>

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col justify-start px-6 sm:px-10 py-12 sm:py-20 w-full">
        {/* Header Section */}
        <div className="text-center sm:text-left space-y-3 mb-10">
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.3)]">
            Onboarding Page
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-transparent rounded-full mx-auto sm:mx-0 shadow-[0_0_15px_rgba(168,85,247,0.6)]"></div>
        </div>

        {/* Subtitle */}
        <p className="mt-3 text-base sm:text-lg text-gray-300 font-medium text-center sm:text-left mb-10">
          Complete your profile now to use{" "}
          <span className="font-semibold text-purple-400">Loom</span>
        </p>

        {/* Form Section */}
        <section className="bg-gradient-to-b from-gray-900/60 via-gray-950/70 to-black/80 backdrop-blur-xl p-6 sm:p-10 rounded-3xl border border-purple-700/30 shadow-[0_0_40px_rgba(168,85,247,0.1)] hover:shadow-[0_0_60px_rgba(168,85,247,0.2)] transition-all duration-300">
          <AccountProfile user={userData} btnTitle="Continue" />
        </section>
      </div>
    </main>
  );
}

export default Page;
