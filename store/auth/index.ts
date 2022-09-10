import create from "zustand";
import { persist } from "zustand/middleware";
import { combine } from "zustand/middleware";

import cookieStorage from "@/lib/cookieStorage";

export const useAuthStore = create(
  persist(
    combine({ accessToken: "" }, (set, get) => ({
      setAccessToken: (token: string) => set({ accessToken: token }),
    })),
    {
      name: "auth",
      getStorage: () => cookieStorage,
    }
  )
);
