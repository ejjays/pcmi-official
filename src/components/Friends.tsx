"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import FollowButton from "./FollowButton";
import UserAvatar from "./UserAvatar";
import UserTooltip from "./UserTooltip";
import { formatNumber } from "@/lib/utils";  // Add this import

interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: Date;
  followers: Array<{
    followerId: string;
  }>;
  _count: {
    posts: number;
    followers: number;
  };
}

interface Hashtag {
  hashtag: string;
  count: number;
}

export default function Friends() {
  const [usersToFollow, setUsersToFollow] = useState<User[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<Hashtag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersResponse, topicsResponse] = await Promise.all([
          fetch('/api/whoToFollow'),
          fetch('/api/trendingTopics')
        ]);

        const [usersData, topicsData] = await Promise.all([
          usersResponse.json(),
          topicsResponse.json()
        ]);

        setUsersToFollow(usersData);
        setTrendingTopics(topicsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <Loader2 className="mx-auto animate-spin" />;
  }

  return (
    <div className="space-y-5 p-5">
      <WhoToFollow usersToFollow={usersToFollow} />
      <TrendingTopics trendingTopics={trendingTopics} />
    </div>
  );
}

interface WhoToFollowProps {
  usersToFollow: User[];
}

function WhoToFollow({ usersToFollow }: WhoToFollowProps) {
  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold">Who to follow</div>
      {usersToFollow.map((user) => (
        <div key={user.id} className="flex items-center justify-between gap-3">
          <UserTooltip user={user}>
            <a href={`/users/${user.username}`} className="flex items-center gap-3">
              <UserAvatar avatarUrl={user.avatarUrl} className="flex-none" />
              <div>
                <p className="line-clamp-1 break-all font-semibold hover:underline">
                  {user.displayName}
                </p>
                <p className="line-clamp-1 break-all text-muted-foreground">
                  @{user.username}
                </p>
              </div>
            </a>
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
  );
}

interface TrendingTopicsProps {
  trendingTopics: Hashtag[];
}

function TrendingTopics({ trendingTopics }: TrendingTopicsProps) {
  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold">Trending topics</div>
      {trendingTopics.map(({ hashtag, count }) => {
        const title = hashtag.split("#")[1];

        return (
          <a key={title} href={`/hashtag/${title}`} className="block">
            <p className="line-clamp-1 break-all font-semibold hover:underline" title={hashtag}>
              {hashtag}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatNumber(count)} {count === 1 ? "post" : "posts"}
            </p>
          </a>
        );
      })}
    </div>
  );
}