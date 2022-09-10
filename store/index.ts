import { useAuthStore } from "@/store/auth";

export const useStore = () => ({
  auth: useAuthStore(),
});
