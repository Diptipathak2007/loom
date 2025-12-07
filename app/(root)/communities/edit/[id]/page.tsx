import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { fetchCommunityDetails } from "@/lib/actions/community.actions";
import CommunityProfile from "@/components/forms/CommunityProfile";

async function Page({ params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return null;

  const { id } = await params;
  const communityDetails = await fetchCommunityDetails(id);

  if (!communityDetails) redirect("/communities");

  // Only allow creator to edit
  if (communityDetails.createdBy.id !== user.id) {
    redirect(`/communities/${id}`);
  }

  const communityData = {
    id: communityDetails.id,
    username: communityDetails.username,
    name: communityDetails.name,
    bio: communityDetails.bio,
    image: communityDetails.image,
  };

  return (
    <main className="mx-auto flex max-w-3xl flex-col justify-start px-10 py-20">
      <h1 className="head-text">Edit Community</h1>
      <p className="mt-3 text-base-regular text-light-2">
        Make changes to your community profile
      </p>

      <section className="mt-9 bg-dark-2 p-10">
        <CommunityProfile community={communityData} btnTitle="Save Changes" />
      </section>
    </main>
  );
}

export default Page;
