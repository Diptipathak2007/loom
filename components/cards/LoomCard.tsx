"use client";

import Link from "next/link";

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
  text,
  author,
}: Props) => {
  return (
    <article className="flex w-full flex-col rounded-xl bg-dark-2 p-7">
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
                    <div className="flex gap-3.5"></div>
                </div>
            </div>
        </div>
      </div>

      
    </article>
  );
};

export default LoomCard;
