import { getNewIdeaRoute, getViewIdeaRoute } from '@ideanick/webapp/src/lib/routes'
import { sendEmail } from './utils'
import type { Idea, User } from '@prisma/client'

/**
 * Отправка приветственного письма при регистрации
 */
export const sendWelcomeEmail = async ({ user }: { user: Pick<User, 'nick' | 'email'> }) => {
  console.log(`📧 Отправка welcome email для пользователя: ${user.email}`)
  return await sendEmail({
    to: user.email,
    subject: 'Thanks For Registration!',
    templateName: 'welcome',
    templateVariables: {
      userNick: user.nick,
      addIdeaUrl: getNewIdeaRoute({ abs: true }),
    },
  })
}

/**
 * Отправка письма о блокировке идеи
 */
export const sendIdeaBlockedEmail = async ({ user, idea }: { user: Pick<User, 'email'>; idea: Pick<Idea, 'nick'> }) => {
  console.log(`📧 Отправка idea blocked email для пользователя: ${user.email}`)
  return await sendEmail({
    to: user.email,
    subject: 'Your Idea Blocked!',
    templateName: 'ideaBlocked',
    templateVariables: {
      ideaNick: idea.nick,
    },
  })
}

/**
 * Отправка письма с самыми популярными идеями
 */
export const sendMostLikedIdeasEmail = async ({
  user,
  ideas,
}: {
  user: Pick<User, 'email'>
  ideas: Array<Pick<Idea, 'nick' | 'name'>>
}) => {
  return await sendEmail({
    to: user.email,
    subject: 'Most Liked Ideas!',
    templateName: 'mostLikedIdeas',
    templateVariables: {
      ideas: ideas.map((idea) => ({
        name: idea.name,
        url: getViewIdeaRoute({ abs: true, ideaNick: idea.nick }),
      })),
    },
  })
}


