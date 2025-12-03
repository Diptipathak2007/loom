import LoomCard from "@/components/cards/LoomCard";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { fetchLoomById } from "@/lib/actions/loom.actions";
import Comment from "@/components/forms/Comment";

const Page = async (props: { params: Promise<{ id: string }> }) => {
    const { id } = await props.params;

    if (!id) return null;

    const user = await currentUser();
    if (!user) return null;

    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) redirect("/onboarding");

    const loom = await fetchLoomById(id);
    if (!loom) return null;

    // 🔥 FIX: convert mongoose document → plain JSON
    const plainLoom = JSON.parse(JSON.stringify(loom));

    return (
        <section className="relative">
            <div className="mx-auto max-w-2xl px-4 pt-10 sm:px-6 lg:max-w-4xl lg:px-8">
                <LoomCard
                    key={plainLoom._id}
                    id={plainLoom._id}
                    currentUserId={user.id || ""}
                    parentId={plainLoom.parentId || null}
                    text={plainLoom.text}
                    author={plainLoom.author}
                    community={plainLoom.community}
                    createdAt={plainLoom.createdAt}
                    comments={plainLoom.children}
                />
            </div>
            <div className="mt-7">
                <Comment
                   loomId={plainLoom._id}
                   currentUserImg={user.imageUrl}
                   currentUserId={user.id}
                />
            </div>
            <div className="mt-10">
                {plainLoom.children?.map((childitem: any) => (
                    <LoomCard
                     key={childitem._id}
                    id={childitem._id}
                    currentUserId={user.id || ""}
                    parentId={childitem.parentId || null}
                    text={childitem.text}
                    author={childitem.author}
                    community={childitem.community}
                    createdAt={childitem.createdAt}
                    comments={childitem.children}
                    />
                ))}
            </div>
        </section>
    );
};

export default Page;
