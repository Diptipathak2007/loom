import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { fetchUser } from "@/lib/actions/user.actions";

import PostLoom from "@/components/forms/PostLoom";

async function Page() {
  const user = await currentUser();
  if (!user) {
    return null;
  }
  const userInfo = await fetchUser(user.id);
  
  if (!userInfo?.onboarded) {
    redirect("/onboarding");
  }
  return(
    <>
    <h1 className="head-text">Create Loom</h1>
    <PostLoom userId={userInfo._id}/>
    </>
  )
}
export default Page;
