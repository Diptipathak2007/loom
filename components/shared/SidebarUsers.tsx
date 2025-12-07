"use client";

import { fetchUsers } from "@/lib/actions/user.actions";
import { useEffect, useState } from "react";
import UserCard from "../cards/UserCard";
import { Input } from "../ui/input";
import Image from "next/image";

interface Props {
  initialUsers: any[];
  currentUserId: string;
}

export default function SidebarUsers({ initialUsers, currentUserId }: Props) {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState(initialUsers);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await fetchUsers({
          userId: currentUserId,
          searchString: search,
          pageSize: 4,
        });
        setUsers(result.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, currentUserId]);

  return (
    <div className='flex flex-1 flex-col justify-start'>
      <div className="flex justify-between items-center mb-4">
        <h3 className='text-heading4-medium text-light-1'>
          Suggested Users
        </h3>
        <a href="/search" className="text-small-medium text-primary-500 hover:underline">View all</a>
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
          placeholder='Search users...'
          className='no-focus searchbar_input'
        />
      </div>

      <div className='flex w-[350px] flex-col gap-10'>
        {loading ? (
            <p className='!text-base-regular text-light-3'>Loading...</p>
        ) : users.length > 0 ? (
          <>
            {users.map((person) => (
              <UserCard
                key={person.id}
                id={person.id}
                name={person.name}
                username={person.username}
                imgUrl={person.image}
                personType='User'
              />
            ))}
          </>
        ) : (
          <p className='!text-base-regular text-light-3'>No users found</p>
        )}
      </div>
    </div>
  );
}
