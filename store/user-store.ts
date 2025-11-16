import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

/**
 * 获取用户显示名称，优先使用昵称，如果没有昵称则显示默认昵称
 */
export function getUserDisplayName(user: User | null): string {
  if (!user) return "猿友同学";
  return user.nickname || "猿友同学";
}

/**
 * 获取用户头像字母，用于 AvatarFallback
 */
export function getUserAvatarLetter(user: User | null): string {
  if (!user) return "U";
  const name = user.nickname || "";
  return name[0]?.toUpperCase() || "U";
}

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: "user-storage",
    }
  )
);

