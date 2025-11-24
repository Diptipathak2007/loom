import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { fetchUser } from "@/lib/actions/user.actions";

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
    
    </>
  )
}
export default Page;
