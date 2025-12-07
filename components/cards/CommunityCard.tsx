"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "../ui/button";
import { addMemberToCommunity } from "@/lib/actions/community.actions";

import { useState } from "react";

interface Props {
  id: string;
  name: string;
  username: string;
  imgUrl: string;
  bio: string;
  members: {
    image: string;
    id: string;
  }[];
  currentUserId: string;
}

const CommunityCard = ({ id, name, username, imgUrl, bio, members, currentUserId }: Props) => {
  const [isMember, setIsMember] = useState(members.some((member) => member.id === currentUserId));
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    setLoading(true);
    try {
        await addMemberToCommunity(id, currentUserId);
        setIsMember(true);
    } catch (error) {
        console.error("Error joining community:", error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <article className="community-card">
      <div className="flex flex-wrap items-center gap-3">
        <Link href={`/communities/${id}`} className="relative h-12 w-12">
          <Image
            src={imgUrl}
            alt="community_logo"
            fill
            className="rounded-full object-cover"
          />
        </Link>

        <div>
          <Link href={`/communities/${id}`}>
            <h4 className="text-base-semibold text-light-1">{name}</h4>
          </Link>
          <p className="text-small-medium text-gray-1">@{username}</p>
        </div>
      </div>

      <p className="mt-4 text-subtle-medium text-gray-1">{bio}</p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <Link href={`/communities/${id}`}>
          <Button size="sm" className="community-card_btn">
            View
          </Button>
        </Link>

        {!isMember ? (
            <Button size="sm" className="community-card_btn" onClick={handleJoin} disabled={loading}>
                {loading ? "Joining..." : "Join"}
            </Button>
        ) : (
             <Button size="sm" className="community-card_btn" disabled>
                Joined
            </Button>
        )}

        {members.length > 0 && (
          <div className="flex items-center">
            {members.map((member, index) => (
              <Image
                key={index}
                src={member.image}
                alt={`user_${index}`}
                width={28}
                height={28}
                className={`${
                  index !== 0 && "-ml-2"
                } rounded-full object-cover`}
              />
            ))}
            {members.length > 3 && (
              <p className="ml-1 text-subtle-medium text-gray-1">
                {members.length}+ Users
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default CommunityCard;
