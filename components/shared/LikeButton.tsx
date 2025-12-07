"use client";

import Image from "next/image";
import { toggleLike } from "@/lib/actions/loom.actions";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

interface Props {
  loomId: string;
  currentUserId: string;
  likes: string[]; // Array of user IDs who liked the post
}

export default function LikeButton({ loomId, currentUserId, likes }: Props) {
  const pathname = usePathname();
  const [isLiked, setIsLiked] = useState(likes.includes(currentUserId));
  const [likesCount, setLikesCount] = useState(likes.length);

  useEffect(() => {
    setIsLiked(likes.includes(currentUserId));
    setLikesCount(likes.length);
  }, [likes, currentUserId]);

  const handleLike = async () => {
    // Optimistic update
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount((prev) => (newIsLiked ? prev + 1 : prev - 1));

    try {
      await toggleLike(loomId, currentUserId, pathname);
    } catch (error) {
      // Revert if failed
      setIsLiked(!newIsLiked);
      setLikesCount((prev) => (newIsLiked ? prev - 1 : prev + 1));
      console.error("Failed to toggle like:", error);
    }
  };

  return (
    <div className="flex items-center gap-1 cursor-pointer" onClick={handleLike}>
      <Image
        src={isLiked ? "/assets/heart-filled.svg" : "/assets/heart-gray.svg"}
        alt="like"
        width={24}
        height={24}
        className="object-contain"
      />
      {likesCount > 0 && (
        <p className="text-subtle-medium text-gray-1">{likesCount}</p>
      )}
    </div>
  );
}
