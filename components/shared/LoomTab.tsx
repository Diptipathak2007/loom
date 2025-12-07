import { fetchUserPosts } from "@/lib/actions/loom.actions";
import { fetchCommunityPosts } from "@/lib/actions/community.actions";
import { redirect } from "next/navigation";
import LoomCard from "../cards/LoomCard";

interface Props{
    currentUserId:string;
    accountId:string;
    accountType:string;
}


const LoomTab = async({currentUserId,accountId,accountType}:Props) => {
    let result:any;
    if(accountType==='User'){
        result=await fetchUserPosts(accountId);
    }else{
        result=await fetchCommunityPosts(accountId);
    }
    if(!result) redirect("/");
    return (
        <section className="mt-9 flex flex-col gap-10">
            {result.Loom.map((Loom:any)=>(
                <LoomCard
                key={Loom._id}
                id={Loom._id}
                currentUserId={currentUserId}
                parentId={Loom.parentId}
                text={Loom.text}
                author={
                    accountType==='User'
                    ?{name:result.name,image:result.image,id:result.id}
                    :{name:Loom.author.name,image:Loom.author.image,id:Loom.author.id}
                }
                community={Loom.community}
                createdAt={Loom.createdAt}
                comments={Loom.children || []}
                
                />
            ))}
        </section>
    )
}

export default LoomTab