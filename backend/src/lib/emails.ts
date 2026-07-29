import { promises as fs } from 'fs'
import path from 'path'
import { type Idea, type User } from '@prisma/client'
import fg from 'fast-glob'
import Handlebars from 'handlebars'
import _ from 'lodash'
import { sendEmailThroughBrevo } from './brevo'
import { getNewIdeaRoute } from '@ideanick/webapp/src/lib/routes'
import { env } from './env'

const getHbrTemplates = _.memoize(async () => {
  try {
    // ПРОБУЕМ НЕСКОЛЬКО ВАРИАНТОВ ПУТЕЙ
    const possiblePaths = [
      path.resolve(process.cwd(), 'emails/dist'), // backend/emails/dist
      path.resolve(process.cwd(), 'src/emails/dist'), // backend/src/emails/dist
      path.resolve(__dirname, '../emails/dist'), // относительно текущего файла
      path.resolve(__dirname, '../../emails/dist'), // на уровень выше
      path.resolve(process.cwd(), '../emails/dist'), // на уровень выше backend
    ]

    let templatesDir = ''
    let htmlPaths: string[] = []

    // Ищем первую существующую папку
    for (const testPath of possiblePaths) {
      try {
        await fs.access(testPath)
        templatesDir = testPath
        const pattern = path.join(testPath, '**/*.html')
        htmlPaths = fg.sync(pattern)
        if (htmlPaths.length > 0) {
          console.log(`✅ Найдены шаблоны в: ${templatesDir}`)
          break
        }
      } catch (error) {
        // Папка не существует, пробуем следующую
        continue
      }
    }

    // Если не нашли ни одного пути, пробуем искать рекурсивно
    if (htmlPaths.length === 0) {
      console.warn('⚠️ Шаблоны не найдены в стандартных путях, ищу рекурсивно...')

      // Ищем все HTML файлы в папке backend
      const searchPattern = path.resolve(process.cwd(), '**/emails/dist/**/*.html')
      htmlPaths = fg.sync(searchPattern, {
        deep: 5,
        ignore: ['**/node_modules/**', '**/.git/**'],
      })

      if (htmlPaths.length > 0) {
        templatesDir = path.dirname(htmlPaths[0])
        console.log(`✅ Найдены шаблоны в: ${templatesDir}`)
      }
    }

    console.log('📁 Путь к шаблонам:', templatesDir)
    console.log('📄 Найдены HTML шаблоны:', htmlPaths)

    const hbrTemplates: Record<string, HandlebarsTemplateDelegate> = {}

    for (const htmlPath of htmlPaths) {
      const templateName = path.basename(htmlPath, '.html')
      const htmlTemplate = await fs.readFile(htmlPath, 'utf8')

      if (!htmlTemplate || htmlTemplate.trim().length === 0) {
        console.warn(`⚠️ Шаблон ${templateName} пустой`)
        continue
      }

      try {
        hbrTemplates[templateName] = Handlebars.compile(htmlTemplate, {
          noEscape: true,
        })
        console.log(`✅ Шаблон ${templateName} успешно скомпилирован`)
      } catch (compileError) {
        console.error(`❌ Ошибка компиляции шаблона ${templateName}:`, compileError)
        hbrTemplates[templateName] = Handlebars.compile('<p>Template not available</p>')
      }
    }

    return hbrTemplates
  } catch (error) {
    console.error('❌ Ошибка при загрузке шаблонов:', error)
    return {}
  }
})

const getEmailHtml = async (
  templateName: string,
  templateVariables: Record<string, string | number | boolean> = {}
) => {
  try {
    const hbrTemplates = await getHbrTemplates()

    if (!hbrTemplates[templateName]) {
      console.error(`❌ Шаблон "${templateName}" не найден. Доступные:`, Object.keys(hbrTemplates))

      // ПРОВЕРЯЕМ ФАЙЛЫ НАПРЯМУЮ
      const possibleFilePaths = [
        path.resolve(process.cwd(), `emails/dist/${templateName}.html`),
        path.resolve(process.cwd(), `src/emails/dist/${templateName}.html`),
        path.resolve(__dirname, `../emails/dist/${templateName}.html`),
        path.resolve(__dirname, `../../emails/dist/${templateName}.html`),
      ]

      for (const filePath of possibleFilePaths) {
        try {
          await fs.access(filePath)
          console.log(`✅ Файл шаблона существует: ${filePath}`)
          // Если файл существует, но не загрузился, пробуем загрузить его напрямую
          const htmlContent = await fs.readFile(filePath, 'utf8')
          const compiled = Handlebars.compile(htmlContent)
          const result = compiled(templateVariables)
          console.log(`✅ Шаблон ${templateName} загружен напрямую`)
          return result
        } catch (accessError) {
          // Файл не существует
          continue
        }
      }

      // FALLBACK - красивое письмо даже если шаблон не найден
      return createFallbackHtml(templateName, templateVariables)
    }

    const hbrTemplate = hbrTemplates[templateName]

    if (typeof hbrTemplate !== 'function') {
      console.error(`❌ Шаблон ${templateName} не является функцией:`, typeof hbrTemplate)
      return createFallbackHtml(templateName, templateVariables)
    }

    const html = hbrTemplate(templateVariables)
    return html
  } catch (error) {
    console.error(`❌ Ошибка при генерации HTML для шаблона ${templateName}:`, error)
    return createFallbackHtml(templateName, templateVariables)
  }
}

// Функция для создания красивого fallback HTML
const createFallbackHtml = (templateName: string, variables: Record<string, any>) => {
  if (templateName === 'welcome') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to IdeaNick!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f4f4f4; }
          .container { background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .header { background: #4CAF50; color: white; padding: 20px; border-radius: 8px 8px 0 0; margin: -30px -30px 20px -30px; text-align: center; }
          .header h1 { margin: 0; }
          .btn { display: inline-block; background: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; margin: 15px 0; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>Welcome to IdeaNick! 🎉</h1></div>
          <h2>Hello, ${variables.userNick || 'User'}!</h2>
          <p>Thank you for registering with IdeaNick. We're excited to have you on board!</p>
          <div style="text-align: center;">
            <a href="${variables.addIdeaUrl || env.WEBAPP_URL + '/ideas/new'}" class="btn">➕ Share Your First Idea</a>
          </div>
          <div class="footer">
            <p>&copy; 2024 IdeaNick. All rights reserved.</p>
            <p><a href="${variables.homeUrl || env.WEBAPP_URL}">${variables.homeUrl || env.WEBAPP_URL}</a></p>
          </div>
        </div>
      </body>
      </html>
    `
  } else if (templateName === 'ideaBlocked') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Idea Blocked</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f4f4f4; }
          .container { background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .header { background: #f44336; color: white; padding: 20px; border-radius: 8px 8px 0 0; margin: -30px -30px 20px -30px; text-align: center; }
          .header h1 { margin: 0; }
          .btn { display: inline-block; background: #2196F3; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; margin: 15px 0; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px; }
          .idea-name { color: #f44336; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>Idea Blocked ⛔</h1></div>
          <p>Hello,</p>
          <p>We regret to inform you that your idea "<span class="idea-name">${variables.ideaNick || 'Unknown'}</span>" has been blocked.</p>
          <div style="text-align: center;">
            <a href="${variables.homeUrl || env.WEBAPP_URL}" class="btn">Visit IdeaNick</a>
          </div>
          <div class="footer">
            <p>&copy; 2024 IdeaNick. All rights reserved.</p>
            <p><a href="${variables.homeUrl || env.WEBAPP_URL}">${variables.homeUrl || env.WEBAPP_URL}</a></p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  return `<h1>Template ${templateName}</h1><p>Variables: ${JSON.stringify(variables)}</p>`
}

const sendEmail = async ({
  to,
  subject,
  templateName,
  templateVariables = {},
}: {
  to: string
  subject: string
  templateName: string
  templateVariables?: Record<string, any>
}) => {
  try {
    const fullTemplateVariables = {
      ...templateVariables,
      homeUrl: env.WEBAPP_URL,
    }

    console.log(`📧 Отправка письма "${templateName}" на ${to}`)
    console.log('📝 Переменные шаблона:', fullTemplateVariables)

    const html = await getEmailHtml(templateName, fullTemplateVariables)

    if (!html || html.trim().length === 0) {
      throw new Error(`Сгенерированный HTML пустой для шаблона ${templateName}`)
    }

    const { loggableResponse } = await sendEmailThroughBrevo({ to, html, subject })

    console.info('✅ sendEmail успешно отправлен', {
      to,
      templateName,
      templateVariables,
      response: loggableResponse,
    })

    return { ok: true }
  } catch (error) {
    console.error('❌ Ошибка в sendEmail:', error)
    return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export const sendWelcomeEmail = async ({ user }: { user: Pick<User, 'nick' | 'email'> }) => {
  console.log(`📧 Отправка welcome email для пользователя: ${user.email}`)
  return await sendEmail({
    to: user.email,
    subject: 'Thanks For Registration!',
    templateName: 'welcome',
    templateVariables: {
      userNick: user.nick,
      addIdeaUrl: `${env.WEBAPP_URL}${getNewIdeaRoute}`,
    },
  })
}

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

export const testTemplates = async () => {
  const templates = await getHbrTemplates()
  console.log('📚 Все загруженные шаблоны:', Object.keys(templates))
  return templates
}

// import { promises as fs } from 'fs'
// import path from 'path'
// import { type Idea, type User } from '@prisma/client'
// import fg from 'fast-glob'
// import Handlebars from 'handlebars'
// import _ from 'lodash'
// import { sendEmailThroughBrevo } from './brevo'
// import { env } from './env'

// const getHbrTemplates = _.memoize(async () => {
//   const htmlPathsPattern = path.resolve(__dirname, '../emails/dist/**/*.html')
//   const htmlPaths = fg.sync(htmlPathsPattern)
//   const hbrTemplates: Record<string, HandlebarsTemplateDelegate> = {}
//   for (const htmlPath of htmlPaths) {
//     const templateName = path.basename(htmlPath, '.html')
//     const htmlTemplate = await fs.readFile(htmlPath, 'utf8')
//     hbrTemplates[templateName] = Handlebars.compile(htmlTemplate)
//   }
//   return hbrTemplates
// })

// const getEmailHtml = async (templateName: string, templateVariables: Record<string, string> = {}) => {
//   const hbrTemplates = await getHbrTemplates()
//   const hbrTemplate = hbrTemplates[templateName]
//   const html = hbrTemplate(templateVariables)
//   return html
// }

// const sendEmail = async ({
//   to,
//   subject,
//   templateName,
//   templateVariables = {},
// }: {
//   to: string
//   subject: string
//   templateName: string
//   templateVariables?: Record<string, any>
// }) => {
//   try {
//     const fullTemplateVaraibles = {
//       ...templateVariables,
//       homeUrl: env.WEBAPP_URL,
//     }
//     const html = await getEmailHtml(templateName, fullTemplateVaraibles)
//     const { loggableResponse } = await sendEmailThroughBrevo({ to, html, subject })
//     console.info('sendEmail', {
//       to,
//       templateName,
//       templateVariables,
//       response: loggableResponse,
//     })
//     return { ok: true }
//   } catch (error) {
//     console.error(error)
//     return { ok: false }
//   }
// }

// export const sendWelcomeEmail = async ({ user }: { user: Pick<User, 'nick' | 'email'> }) => {
//   return await sendEmail({
//     to: user.email,
//     subject: 'Thanks For Registration!',
//     templateName: 'welcome',
//     templateVariables: {
//       userNick: user.nick,
//       addIdeaUrl: `${env.WEBAPP_URL}/ideas/new`,
//     },
//   })
// }

// export const sendIdeaBlockedEmail = async ({ user, idea }: { user: Pick<User, 'email'>; idea: Pick<Idea, 'nick'> }) => {
//   return await sendEmail({
//     to: user.email,
//     subject: 'Your Idea Blocked!',
//     templateName: 'ideaBlocked',
//     templateVariables: {
//       ideaNick: idea.nick,
//     },
//   })
// }
