"use client";

import { fetchCommunities } from "@/lib/actions/community.actions";
import { useEffect, useState } from "react";
import CommunityCard from "../cards/CommunityCard";
import { Input } from "../ui/input";
import Image from "next/image";

interface Props {
  initialCommunities: any[];
  currentUserId: string;
}

export default function SidebarCommunities({ initialCommunities, currentUserId }: Props) {
  const [search, setSearch] = useState("");
  const [communities, setCommunities] = useState(initialCommunities);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await fetchCommunities({
          searchString: search,
          pageSize: 4,
        });
        setCommunities(result.communities);
      } catch (error) {
        console.error("Error fetching communities:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  return (
    <div className='flex flex-1 flex-col justify-start'>
      <div className="flex justify-between items-center mb-4">
        <h3 className='text-heading4-medium text-light-1'>
          Suggested Communities
        </h3>
        <a href="/communities" className="text-small-medium text-primary-500 hover:underline">View all</a>
      </div>

      <div className='searchbar mb-6'>
        <Image
          src='/assets/search-gray.svg'
          alt='search'
          width={24}
          height={24}
          className='object-contain'
        />
        <Input
          id='text'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Search communities...'
          className='no-focus searchbar_input'
        />
      </div>

      <div className='flex w-[350px] flex-col gap-9'>
        {loading ? (
             <p className='!text-base-regular text-light-3'>Loading...</p>
        ) : communities.length > 0 ? (
          <>
            {communities.map((community) => (
              <CommunityCard
                key={community.id}
                id={community.id}
                name={community.name}
                username={community.username}
                imgUrl={community.image}
                bio={community.bio}
                members={community.members}
                currentUserId={currentUserId}
              />
            ))}
          </>
        ) : (
          <p className='!text-base-regular text-light-3'>
            No communities found
          </p>
        )}
      </div>
    </div>
  );
}
