import { CookieStorage } from 'cookie-storage'

export const cookieStorage = new CookieStorage({
  domain: process.env.NEXT_PUBLIC_HOST,
  secure: true,
  sameSite: 'Strict'
})
