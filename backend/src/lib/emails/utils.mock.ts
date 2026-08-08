// import { type sendEmail } from './utils'

// jest.mock('./utils', () => {
//   const original = jest.requireActual('./utils')
//   const mockedSendEmail: typeof sendEmail = jest.fn(async () => {
//     return {
//       ok: true,
//     }
//   })
//   return {
//     ...original,
//     sendEmail: mockedSendEmail,
//   }
// })
/**
 * Мок для тестирования email утилит
 * Используется в тестах для подмены реальной отправки
 */
import { type sendEmail } from './utils'

jest.mock('./utils', () => {
  const original = jest.requireActual('./utils')

  const mockedSendEmail: typeof sendEmail = jest.fn(async () => {
    return {
      ok: true,
    }
  })

  return {
    ...original,
    sendEmail: mockedSendEmail,
  }
})

// Экспортируем моки для использования в тестах
export { sendEmail }
