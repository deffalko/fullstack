import { z } from 'zod'
import { zEmailRequired, zNickRequired, zStringRequired } from '@ideanick/shared/src/zod'

export const zSignUpTrpcInput = z.object({
  nick: zNickRequired,
  email: zEmailRequired,
  password: zStringRequired,
})


