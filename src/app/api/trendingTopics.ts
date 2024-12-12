import { NextApiRequest, NextApiResponse } from 'next';
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const result = await prisma.$queryRaw<{ hashtag: string; count: bigint }[]>`
    SELECT LOWER(unnest(regexp_matches(content, '#[[:alnum:]_]+', 'g'))) AS hashtag, COUNT(*) AS count
    FROM posts
    GROUP BY (hashtag)
    ORDER BY count DESC, hashtag ASC
    LIMIT 5
  `;

  const trendingTopics = result.map((row) => ({
    hashtag: row.hashtag,
    count: Number(row.count),
  }));

  res.status(200).json(trendingTopics);
}