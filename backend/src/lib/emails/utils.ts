import { env } from '../env'
import { promises as fs } from 'fs'
import { sendEmailThroughBrevo } from '../brevo'
import { winstonLogger } from '../logger'
import * as path from 'path'
import * as Handlebars from 'handlebars'
import * as _ from 'lodash'

// Типы для переменных шаблонов
type TemplateVariables = Record<string, any>

/**
 * Загрузка всех Handlebars шаблонов с кешированием
 */
const getHbrTemplates = _.memoize(async (): Promise<Record<string, HandlebarsTemplateDelegate>> => {
  try {
    const templatesDir = path.resolve(process.cwd(), 'src/emails/dist')

    console.log(`📁 Загрузка шаблонов из: ${templatesDir}`)

    // Проверяем существование папки
    try {
      await fs.access(templatesDir)
    } catch {
      console.warn(`⚠️ Папка не найдена: ${templatesDir}`)
      return {}
    }

    // ЧИТАЕМ КОНКРЕТНЫЕ ФАЙЛЫ напрямую
    const templateNames = ['welcome', 'ideaBlocked', 'mostLikedIdeas']
    const hbrTemplates: Record<string, HandlebarsTemplateDelegate> = {}

    for (const templateName of templateNames) {
      const filePath = path.join(templatesDir, `${templateName}.html`)
      try {
        await fs.access(filePath)
        const htmlContent = await fs.readFile(filePath, 'utf8')
        if (htmlContent && htmlContent.trim().length > 0) {
          hbrTemplates[templateName] = Handlebars.compile(htmlContent, {
            noEscape: true,
          })
          console.log(`✅ Шаблон ${templateName} загружен`)
        }
      } catch (error) {
        console.warn(`⚠️ Шаблон ${templateName} не найден:`, filePath)
      }
    }

    console.log(`✅ Загружено шаблонов: ${Object.keys(hbrTemplates).length}`)
    return hbrTemplates
  } catch (error) {
    console.error('❌ Ошибка при загрузке шаблонов:', error)
    return {}
  }
})

/**
 * Генерация HTML для письма по имени шаблона
 */
const getEmailHtml = async (templateName: string, templateVariables: TemplateVariables = {}): Promise<string> => {
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
        } catch {
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

/**
 * Функция для создания красивого fallback HTML, если шаблон не найден
 */
const createFallbackHtml = (templateName: string, variables: TemplateVariables): string => {
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

  // Общий fallback
  return `<h1>Template ${templateName}</h1><p>Variables: ${JSON.stringify(variables)}</p>`
}

/**
 * Основная функция отправки email с использованием Handlebars шаблонов
 */
export const sendEmail = async ({
  to,
  subject,
  templateName,
  templateVariables = {},
}: {
  to: string
  subject: string
  templateName: string
  templateVariables?: TemplateVariables
}): Promise<{ ok: boolean; error?: string }> => {
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

    winstonLogger.info('email', '✅ sendEmail успешно отправлен', {
      to,
      templateName,
      templateVariables,
      response: loggableResponse,
    })

    return { ok: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    winstonLogger.error('email', error, {
      to,
      templateName,
      templateVariables,
    })
    return { ok: false, error: errorMessage }
  }
}
