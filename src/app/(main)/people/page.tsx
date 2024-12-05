import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";
import UserAvatar from "@/components/UserAvatar";
import UserTooltip from "@/components/UserTooltip";
import FollowButton from "@/components/FollowButton";
import Link from "next/link";
import VerifiedBadge from "@/components/VerifiedBadge";

export default async function PeoplePage() {
  const { user } = await validateRequest();

  if (!user) return null;

  const usersToFollow = await prisma.user.findMany({
    where: {
      NOT: {
        id: user.id,
      },
      followers: {
        none: {
          followerId: user.id,
        },
      },
    },
    select: getUserDataSelect(user.id),
    take: 20,
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <h1 className="text-2xl font-bold px-4">People</h1>
        <div className="divide-y">
          {usersToFollow.map((user) => (
            <div key={user.id} className="flex items-center justify-between gap-4 p-4">
              <UserTooltip user={user}>
                <Link
                  href={`/users/${user.username}`}
                  className="flex items-center gap-3"
                >
                  <UserAvatar avatarUrl={user.avatarUrl} className="flex-none" />
                  <div>
  <p className="line-clamp-1 break-all font-semibold hover:underline flex items-center">
    {user.displayName}
    {user.isVerified && (
      <VerifiedBadge 
        size="md" 
        className="ml-1"
      />
    )}
  </p>
  <p className="line-clamp-1 break-all text-muted-foreground">
    @{user.username}
  </p>
</div>
                </Link>
              </UserTooltip>
              <FollowButton
                userId={user.id}
                initialState={{
                  followers: user._count.followers,
                  isFollowedByUser: user.followers.some(
                    ({ followerId }) => followerId === user.id,
                  ),
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
