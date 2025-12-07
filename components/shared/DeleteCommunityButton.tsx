"use client";

import { deleteCommunity } from "@/lib/actions/community.actions";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function DeleteCommunityButton({ communityId }: { communityId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this community? This action cannot be undone.");
    if (confirmed) {
        await deleteCommunity(communityId);
        router.push("/communities");
    }
  };

  return (
    <div
      className='flex cursor-pointer gap-3 rounded-lg px-4 py-2'
      onClick={handleDelete}
    >
      <Image src='/assets/delete.svg' alt='delete' width={16} height={16} />
      
    </div>
  );
}
