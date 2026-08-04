import cors from 'cors'
import { env } from './lib/env'
import express from 'express'
import { createAppContext, type AppContext } from './lib/ctx'
import { applyPassportToExpressApp } from './lib/passport'
import { applyTrpcToExpressApp } from './lib/trpc'
import { trpcRouter } from './router'
import { presetDb } from './scripts/presetDb'
import { sendWelcomeEmail, sendIdeaBlockedEmail } from './lib/emails'
import { applyCron } from './lib/cron'
import { logger } from './lib/logger'

// Убираем лишний app здесь и используем только один

void (async () => {
  let ctx: AppContext | null = null
  try {
    ctx = createAppContext()
    await presetDb(ctx)

    // Создаем ОДИН экземпляр приложения
    const expressApp = express()

    // Middleware
    expressApp.use(cors())
    expressApp.use(express.json()) // ✅ Добавляем парсинг JSON

    // Простые endpoints
    expressApp.get('/ping', (req, res) => {
      res.send('pong')
    })

    // ============================================
    // ТЕСТОВЫЙ ENDPOINT ДЛЯ ОТПРАВКИ ПИСЕМ
    // ============================================
    expressApp.post('/api/test-email', async (req, res) => {
      try {
        const { email, nick, ideaNick, type } = req.body

        console.log('📧 Test email request:', { email, nick, ideaNick, type })

        // Валидация email
        if (!email) {
          return res.status(400).json({
            error: 'Email is required. Example: {"email":"test@gmail.com"}',
          })
        }

        let result
        let message

        if (type === 'blocked') {
          // Отправляем blocked email
          result = await sendIdeaBlockedEmail({
            user: { email },
            idea: { nick: ideaNick || 'TestIdea' },
          })
          message = `Blocked email sent to ${email} for idea "${ideaNick || 'TestIdea'}"`
          console.log('✅ Blocked email sent to:', email)
        } else {
          // Отправляем welcome email (по умолчанию)
          result = await sendWelcomeEmail({
            user: {
              email,
              nick: nick || 'TestUser',
            },
          })
          message = `Welcome email sent to ${email} for user "${nick || 'TestUser'}"`
          console.log('✅ Welcome email sent to:', email)
        }

        res.json({
          success: true,
          message,
          result,
          sentAt: new Date().toISOString(),
        })
      } catch (error) {
        console.error('❌ Error sending test email:', error)
        res.status(500).json({
          success: false,
          error: 'Failed to send email',
          details: error instanceof Error ? error.message : String(error),
        })
      }
    })

    // Passport и tRPC
    applyPassportToExpressApp(expressApp, ctx)
    await applyTrpcToExpressApp(expressApp, ctx, trpcRouter)

    applyCron(ctx)

    expressApp.use((error: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error('express', error)
      if (res.headersSent) {
        next(error)
        return
      }
      res.status(500).send('Internal server error')
    })

    // Запуск сервера
    expressApp.listen(env.PORT, () => {
      // console.info(`🚀 Listening at http://localhost:${env.PORT}`)
      logger.info('express', `🚀 Listening at http://localhost:${env.PORT}`)
      console.info(`📧 Test email endpoint: http://localhost:${env.PORT}/api/test-email`)
      console.info(`🏥 Health check: http://localhost:${env.PORT}/ping`)
    })
  } catch (error) {
    // console.error(error)
    logger.error('app', error)
    await ctx?.stop()
  }
})()

// import cors from 'cors'
// import express from 'express'
// import { createAppContext, type AppContext } from './lib/ctx'
// import { env } from './lib/env'
// import { applyPassportToExpressApp } from './lib/passport'
// import { applyTrpcToExpressApp } from './lib/trpc'
// import { trpcRouter } from './router'
// import { presetDb } from './scripts/presetDb'

// void (async () => {
//   let ctx: AppContext | null = null
//   try {
//     ctx = createAppContext()
//     await presetDb(ctx)
//     const expressApp = express()
//     expressApp.use(cors())
//     expressApp.get('/ping', (req, res) => {
//       res.send('pong')
//     })
//     applyPassportToExpressApp(expressApp, ctx)
//     await applyTrpcToExpressApp(expressApp, ctx, trpcRouter)
//     expressApp.listen(env.PORT, () => {
//       console.info(`Listening at http://localhost:${env.PORT}`)
//     })
//   } catch (error) {
//     console.error(error)
//     await ctx?.stop()
//   }
// })()
