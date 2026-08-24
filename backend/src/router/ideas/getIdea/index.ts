import _ from 'lodash'
import { zGetIdeaTrpcInput } from './input'
import { trpcLoggedProcedure } from '../../../lib/trpc'
import { ExpectedError } from '../../../lib/error'

export const getIdeaTrpcRoute = trpcLoggedProcedure.input(zGetIdeaTrpcInput).query(async ({ ctx, input }) => {
  const rawIdea = await ctx.prisma.idea.findUnique({
    where: {
      nick: input.ideaNick,
    },
    include: {
      author: {
        select: {
          id: true,
          nick: true,
          name: true,
          avatar: true,
        },
      },
      ideasLikes: {
        select: {
          id: true,
        },
        where: {
          userId: ctx.me?.id,
        },
      },
      _count: {
        select: {
          ideasLikes: true,
        },
      },
    },
  })
  if (rawIdea?.blockedAt) {
    throw new ExpectedError('Idea is blocked by administrator')
  }
  const isLikedByMe = !!rawIdea?.ideasLikes.length
  const likesCount = rawIdea?._count.ideasLikes || 0
  const idea = rawIdea && { ..._.omit(rawIdea, ['ideasLikes', '_count']), isLikedByMe, likesCount }

  return { idea }
})


