import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { fetchUser } from "@/lib/actions/user.actions";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  if (!id) {
    redirect("/");
  }

  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(id);

  if (!userInfo?.onboarded) {
    redirect("/onboarding");
  }

  return <section>Profile Page</section>;
}
