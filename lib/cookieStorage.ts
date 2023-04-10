import { CookieStorage } from "cookie-storage";

const cookieStorage = new CookieStorage({
  domain: process.env.NEXT_PUBLIC_HOST,
  secure: true,
  sameSite: "Strict",
});

export default cookieStorage;
