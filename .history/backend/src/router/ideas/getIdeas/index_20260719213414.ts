import _ from 'lodash'
import { trpc } from '../../../lib/trpc'
import { zGetIdeasTrpcInput } from './input'

export const getIdeasTrpcRoute = trpc.procedure.input(zGetIdeasTrpcInput).query(async ({ ctx, input }) => {
  // 1. Очищаем поисковый запрос
  const search = input.search?.trim() || ''

  // 2. Разбиваем на слова, убираем пустые
  const searchWords = search.split(/\s+/).filter((word) => word.length > 0)

  // 3. Строим условие для поиска
  let whereCondition = {}

  if (searchWords.length > 0) {
    // Для КАЖДОГО слова из запроса
    const wordConditions = searchWords.map((word) => ({
      OR: [
        { name: { contains: word, mode: 'insensitive' } },
        { description: { contains: word, mode: 'insensitive' } },
        { text: { contains: word, mode: 'insensitive' } },
      ],
    }))

    // Если несколько слов - ищем все (AND)
    whereCondition = {
      AND: wordConditions,
    }
  }

  const rawIdeas = await ctx.prisma.idea.findMany({
    select: {
      id: true,
      nick: true,
      name: true,
      description: true,
      serialNumber: true,
      _count: {
        select: {
          ideasLikes: true,
        },
      },
    },
    where: {
      blockedAt: null,
      ...whereCondition,
    },
    orderBy: [
      {
        createdAt: 'desc',
      },
      {
        serialNumber: 'desc',
      },
    ],
    cursor: input.cursor ? { serialNumber: input.cursor } : undefined,
    take: input.limit + 1,
  })

  const nextIdea = rawIdeas.at(input.limit)
  const nextCursor = nextIdea?.serialNumber
  const rawIdeasExceptNext = rawIdeas.slice(0, input.limit)
  const ideasExceptNext = rawIdeasExceptNext.map((idea) => ({
    ..._.omit(idea, ['_count']),
    likesCount: idea._count.ideasLikes,
  }))

  return { ideas: ideasExceptNext, nextCursor }
})
