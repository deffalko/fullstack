import { z } from 'zod'
import { zNickRequired } from '@ideanick/shared/src/zod'

export const zUpdateProfileTrpcInput = z.object({
  nick: zNickRequired,
  name: z.string().max(50).default(''),
})
