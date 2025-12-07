import { currentUser } from "@clerk/nextjs/server";
import { fetchCommunities } from "@/lib/actions/community.actions";
import { fetchUsers } from "@/lib/actions/user.actions";
import SidebarCommunities from "./SidebarCommunities";
import SidebarUsers from "./SidebarUsers";

async function RightSidebar() {
  const user = await currentUser();
  if (!user) return null;

  const similarMinds = await fetchUsers({
    userId: user.id,
    pageSize: 4,
  });

  const suggestedCommunities = await fetchCommunities({ pageSize: 4 });

  return (
    <section className='custom-scrollbar rightsidebar'>
      <SidebarCommunities 
        initialCommunities={suggestedCommunities.communities} 
        currentUserId={user.id} 
      />
      
      <SidebarUsers 
        initialUsers={similarMinds.users} 
        currentUserId={user.id} 
      />
    </section>
  );
}

export default RightSidebar;