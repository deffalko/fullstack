// Используем type вместо interface
// type WindowWithYm = Window & {
//   ym: (id: number, method: string, ...args: unknown[]) => void
// }

// Расширяем глобальный Window
declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    ym: (id: number, method: string, ...args: unknown[]) => void
  }
}

// Константа с ID счётчика (вынесите её для удобства)
const METRIKA_ID = 111463966 // или ваш ID

export const trackEvent = (eventName: string): void => {
  if (typeof window !== 'undefined' && window.ym) {
    window.ym(METRIKA_ID, 'reachGoal', eventName)
    console.log(`Yandex Metrika: ${eventName}`)
  } else {
    console.warn('Yandex Metrika not loaded')
  }
}
