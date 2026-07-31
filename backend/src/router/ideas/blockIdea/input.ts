import { z } from 'zod'
import { zStringRequired } from '@ideanick/shared/src/zod'

export const zBlockIdeaTrpcInput = z.object({
  ideaId: zStringRequired,
})
