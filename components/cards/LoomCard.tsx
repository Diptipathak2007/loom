"use client";

import Image from "next/image";
import Link from "next/link";
import { is } from "zod/v4/locales";

interface Props {
  id: string;
  currentUserId: string;
  parentId: string | null;
  text: string;
  author: {
    name: string;
    image: string;
    id: string;
  };
  community: {
    name: string;
    image: string;
    id: string;
  } | null;
  createdAt: string;
  comments: {
    author: {
      image: string;
    };
  }[];
  isComment?: boolean;
}

const LoomCard = ({
  id,
  currentUserId,
  parentId,
  text,
  author,
  community,
  createdAt,
  comments,
  isComment
}: Props) => {
  return (
    <article className={`flex w-full flex-col rounded-xl bg-dark-2 p-7 ${isComment ? 'px-0 xs:px-7':'bg-dark-2 p-7'}`}>
      <div className="flex items-start justify-between">
        <div className="flex w-full flex-1 flex-row gap-4">
            <div className="flex flex-col items-center">
                <Link href={`/profile/${author.id}`}>
                    <img
                        src={author.image}
                        alt={author.name}
                        className="h-10 w-10 rounded-full object-cover"
                    />
                </Link>
                <div className="thread-card_bar"/>
            </div>
            <div className="flex w-full flex-col">
                <Link href={`/profile/${author.id}`}>
                    <h3 className="text-light-1 font-medium hover:underline">
                        {author.name}
                    </h3>
                </Link>
                <p className="mt-2 text-small text-light-2">
                     {text}
                </p>
                <div className="mt-5 flex-col gap-3">
                    <div className="flex gap-3.5">
                      <Image src="/assets/heart-gray.svg" alt="like" width={24} height={24} className="cursor-pointer object-contain" />
                      <Link href={`/loom/${'id'}`}>
                        <Image src="/assets/reply.svg" alt="like" width={24} height={24} className="cursor-pointer object-contain" />
                      </Link>
                      
                      <Image src="/assets/repost.svg" alt="like" width={24} height={24} className="cursor-pointer object-contain" />
                      <Image src="/assets/share.svg" alt="like" width={24} height={24} className="cursor-pointer object-contain" />
                      {isComment && comments.length > 0 }{
                        <Link href={`/loom/${id}`}>
                          <p className="mt-1 text-subtle-medium text-gray-1">
                            {comments.length} replies
                          </p>
                        </Link>
                      }
                    </div>
                </div>
            </div>
        </div>
      </div>

      
    </article>
  );
};

export default LoomCard;
