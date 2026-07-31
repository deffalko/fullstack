import { z } from 'zod'
import { zStringRequired } from '@ideanick/shared/src/zod'

export const zSetIdeaLikeIdeaTrpcInput = z.object({
  ideaId: zStringRequired,
  isLikedByMe: z.boolean(),
})
