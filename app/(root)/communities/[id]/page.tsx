import { currentUser } from "@clerk/nextjs/server";
import ProfileHeader from "@/components/shared/ProfileHeader";
import {Tabs,TabsContent,TabsList,TabsTrigger} from "@/components/ui/tabs"
import { profileTabs,communityTabs } from "@/constants";
import Image from "next/image";
import LoomTab from "@/components/shared/LoomTab";
import { fetchCommunityDetails } from "@/lib/actions/community.actions";
import UserCard from "@/components/cards/UserCard";


export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
 
  const user = await currentUser();
  if (!user) return null;

  const communityDetails = await fetchCommunityDetails(id);

  return (
    <section>
      <ProfileHeader
        accountId={communityDetails.id}
        authUserId={user.id}
        name={communityDetails.name}
        username={communityDetails.username}
        imgUrl={communityDetails.image}
        bio={communityDetails.bio}
        type="Community"
        isOwner={communityDetails.createdBy.id === user.id}
      />
      <div className="mt-9">
        <Tabs defaultValue="Loom" className="w-full">
          <TabsList className="tab">
             {communityTabs.map((tab)=>(
                <TabsTrigger key={tab.value} value={tab.value} className="tab">
                  <Image
                  src={tab.icon}
                  alt={tab.label}
                  width={24}
                  height={24}
                  className="object-contain"
                  />
                  <p className="max-sm:hidden">{tab.label}</p>
                  {tab.label==='Loom'&&(<p className="ml-rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2">{communityDetails?.threadsCount}</p>)}
            
                </TabsTrigger>
             ))}
          </TabsList>
          
          <TabsContent value="Loom" className="w-full text-light-1">
              <LoomTab
              currentUserId={user.id}
              accountId={communityDetails.id}
              accountType="Community"
              />
          </TabsContent>

          <TabsContent value='members' className='mt-9 w-full text-light-1'>
            <section className='mt-9 flex flex-col gap-10'>
              {communityDetails.members.map((member: any) => (
                <UserCard
                  key={member.id}
                  id={member.id}
                  name={member.name}
                  username={member.username}
                  imgUrl={member.image}
                  personType='User'
                />
              ))}
            </section>
          </TabsContent>

          <TabsContent value='requests' className='w-full text-light-1'>
            {/* @ts-ignore */}
            <LoomTab
              currentUserId={user.id}
              accountId={communityDetails._id}
              accountType='Community'
            />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
