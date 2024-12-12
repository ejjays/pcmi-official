"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { PostData } from "@/lib/types";
import { cn, formatRelativeDate } from "@/lib/utils";
import { Media } from "@prisma/client";
import { MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Comments from "../comments/Comments";
import Linkify from "../Linkify";
import UserAvatar from "../UserAvatar";
import UserTooltip from "../UserTooltip";
import BookmarkButton from "./BookmarkButton";
import LikeButton from "./LikeButton";
import PostMoreButton from "./PostMoreButton";
import VerifiedBadge from "../VerifiedBadge";
import FollowButton from "../FollowButton";

interface PostProps {
  post: PostData;
}

export default function Post({ post }: PostProps) {
  const { user } = useSession();
  const [showComments, setShowComments] = useState(false);

  return (
    <article className="group/post w-full bg-card md:shadow-sm md:rounded-2xl">
      <div className="p-5 pb-3">
        <div className="flex justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            <UserTooltip user={post.user}>
              <Link href={`/users/${post.user.username}`}>
                <UserAvatar avatarUrl={post.user.avatarUrl} />
              </Link>
            </UserTooltip>
            <div>
              <UserTooltip user={post.user}>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/users/${post.user.username}`}
                    className="block font-medium hover:underline"
                  >
                    <b>{post.user.displayName}</b>
                  </Link>
                  {post.user.isVerified && (
                    <VerifiedBadge
                      size="md"
                      showTooltip={true}
                    />
                  )}
                  {user.id !== post.user.id && (
                    <>
                      <span className="text-muted-foreground mx-2" style={{ fontWeight: 'bolder', fontSize: '2em' }}>•</span>
                      <FollowButton
                        userId={post.user.id}
                        initialState={{
                          followers: post.user._count.followers,
                          isFollowedByUser: post.user.followers.some(
                            (follower) => follower.followerId === user.id
                          ),
                        }}
                        variant="text"
                      />
                    </>
                  )}
                </div>
              </UserTooltip>
              <Link
                href={`/posts/${post.id}`}
                className="block text-sm text-muted-foreground hover:underline"
                suppressHydrationWarning
              >
                {formatRelativeDate(post.createdAt)}
              </Link>
            </div>
          </div>
          {post.user.id === user.id && (
            <PostMoreButton
              post={post}
              className="opacity-0 transition-opacity group-hover/post:opacity-100"
            />
          )}
        </div>
        <div className="mt-3">
          <Linkify>
            <div className="whitespace-pre-line break-words">{post.content}</div>
          </Linkify>
        </div>
      </div>
      {!!post.attachments.length && (
        <div className="w-full">
          <MediaPreviews attachments={post.attachments} />
        </div>
      )}
      <div className="p-5 pt-3">
        <hr className="text-muted-foreground mb-3" />
        <div className="flex justify-between gap-5">
          <div className="flex items-center gap-5">
            <LikeButton
              postId={post.id}
              initialState={{
                likes: post._count.likes,
                isLikedByUser: post.likes.some((like) => like.userId === user.id),
              }}
            />
            <CommentButton
              post={post}
              onClick={() => setShowComments(!showComments)}
            />
          </div>
          <BookmarkButton
            postId={post.id}
            initialState={{
              isBookmarkedByUser: post.bookmarks.some(
                (bookmark) => bookmark.userId === user.id,
              ),
            }}
          />
        </div>
        {showComments && <Comments post={post} />}
      </div>
    </article>
  );
}

interface MediaPreviewsProps {
  attachments: Media[];
}

function MediaPreviews({ attachments }: MediaPreviewsProps) {
  return (
    <div
      className={cn(
        "flex flex-col w-full",
        attachments.length > 1 && "sm:grid sm:grid-cols-2"
      )}
    >
      {attachments.map((m) => (
        <MediaPreview key={m.id} media={m} />
      ))}
    </div>
  );
}

interface MediaPreviewProps {
  media: Media;
}

function MediaPreview({ media }: MediaPreviewProps) {
  if (media.type === "IMAGE") {
    return (
      <Image
        src={media.url}
        alt="Attachment"
        width={500}
        height={500}
        className="w-full h-auto object-cover"
      />
    );
  }

  if (media.type === "VIDEO") {
    return (
      <video
        src={media.url}
        controls
        className="w-full h-auto"
      />
    );
  }

  return <p className="text-destructive">Unsupported media type</p>;
}

interface CommentButtonProps {
  post: PostData;
  onClick: () => void;
}

function CommentButton({ post, onClick }: CommentButtonProps) {
  return (
    <button onClick={onClick} className="flex items-center gap-2">
      <MessageCircle className="size-5" />
      <span className="text-sm font-medium tabular-nums">
        {post._count.comments}{" "}
        <span className="hidden sm:inline">comments</span>
      </span>
    </button>
  );
}