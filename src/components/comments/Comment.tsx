import { useSession } from "@/app/(main)/SessionProvider";
import { CommentData } from "@/lib/types";
import { formatRelativeDate } from "@/lib/utils";
import Link from "next/link";
import UserAvatar from "../UserAvatar";
import UserTooltip from "../UserTooltip";
import CommentMoreButton from "./CommentMoreButton";
import VerifiedBadge from "@/components/VerifiedBadge";

interface CommentProps {
  comment: CommentData;
}

export default function Comment({ comment }: CommentProps) {
  const { user } = useSession();

  return (
    <div className="group/comment flex gap-3 py-3">
      <div className="flex-shrink-0">
        <UserTooltip user={comment.user}>
          <Link href={`/users/${comment.user.username}`}>
            <div className="sm:hidden">
              <UserAvatar avatarUrl={comment.user.avatarUrl} size={30} />
            </div>
            <div className="hidden sm:block">
              <UserAvatar avatarUrl={comment.user.avatarUrl} size={40} />
            </div>
          </Link>
        </UserTooltip>
      </div>

      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 text-sm">
          <UserTooltip user={comment.user}>
            <Link
              href={`/users/${comment.user.username}`}
              className="font-medium hover:underline inline-flex items-center gap-1"
            >
              {comment.user.displayName}
              {comment.user.isVerified && (
                <VerifiedBadge size="sm"/>
              )}
            </Link>
          </UserTooltip>
          <span className="text-muted-foreground text-xs whitespace-nowrap">
            {formatRelativeDate(comment.createdAt)}
          </span>
        </div>
        <div className="break-words">{comment.content}</div>
      </div>

      {comment.user.id === user.id && (
        <CommentMoreButton
          comment={comment}
          className="ms-auto opacity-0 transition-opacity group-hover/comment:opacity-100"
        />
      )}
    </div>
  );
}