import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { fetchUser } from "@/lib/actions/user.actions";
import ProfileHeader from "@/components/shared/ProfileHeader";
import {Tabs,TabsContent,TabsList,TabsTrigger} from "@/components/ui/tabs"
import { profileTabs } from "@/constants";
import Image from "next/image";
import LoomTab from "@/components/shared/LoomTab";

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

  return (
    <section>
      <ProfileHeader
        accountId={userInfo.id}
        authUserId={user.id}
        name={userInfo.name}
        username={userInfo.username}
        imgUrl={userInfo.image}
        bio={userInfo.bio}
      />
      <div className="mt-9">
        <Tabs defaultValue="Loom" className="w-full">
          <TabsList className="tab">
             {profileTabs.map((tab)=>(
                <TabsTrigger key={tab.value} value={tab.value} className="tab">
                  <Image
                  src={tab.icon}
                  alt={tab.label}
                  width={24}
                  height={24}
                  className="object-contain"
                  />
                  <p className="max-sm:hidden">{tab.label}</p>
                  {tab.label==='Loom'&&(<p className="ml-rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2">{userInfo?.Loom?.length}</p>)}
            
                </TabsTrigger>
             ))}
          </TabsList>
          {profileTabs.map((tab)=>(
            <TabsContent key={`content-${tab.label}`} value={tab.value}
            className="w-full text-light-1"
            >
              <LoomTab
              currentUserId={user.id}
              accountId={userInfo.id}
              accountType="User"
              />
              
            </TabsContent>
          ))}
            
        </Tabs>
      </div>
    </section>
  );
}
