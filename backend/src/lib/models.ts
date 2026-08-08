import { type User } from '@prisma/client'
import { pick } from '@ideanick/shared/src/pick'
import * as _ from 'lodash'

export const toClientMe = (user: User | null) => {
  return user && pick(user, ['id', 'nick', 'name', 'permissions', 'email', 'avatar'])
}
