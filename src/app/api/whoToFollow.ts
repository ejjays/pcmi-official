import { NextApiRequest, NextApiResponse } from 'next';
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user } = await validateRequest();

  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

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
    take: 5,
  });

  res.status(200).json(usersToFollow);
}