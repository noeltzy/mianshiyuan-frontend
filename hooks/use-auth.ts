import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { login, register, logout, getCurrentUser } from "@/lib/api/auth";
import { getUserSettings } from "@/lib/api/user-settings";
import { useUserStore } from "@/store/user-store";
import { getToken } from "@/lib/utils/token";
import type { LoginRequest, RegisterRequest } from "@/lib/api/auth";
import type { User, UserSetting } from "@/types";

/**
 * 获取用户设置信息的 Hook
 */
export function useUserSettings() {
  const { setSettings } = useUserStore();
  const token = typeof window !== "undefined" ? getToken() : null;
  const isLoggedIn = !!token;

  return useQuery({
    queryKey: ["userSettings"],
    queryFn: async () => {
      const settings = await getUserSettings();
      // 将设置数组转换为键值对格式
      const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.settingKey] = setting.settingValue;
        return acc;
      }, {} as Record<string, string>);
      
      setSettings(settingsMap);
      return settingsMap;
    },
    enabled: isLoggedIn, // 只有登录时才获取设置
    staleTime: 0, // 设置为0确保总是获取最新数据
    gcTime: 5 * 60 * 1000, // 5分钟缓存时间
  });
}

/**
 * 获取当前用户信息的 Hook
 */
export function useCurrentUser() {
  const { setUser, clearUser } = useUserStore();
  const token = typeof window !== "undefined" ? getToken() : null;

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        const user = await getCurrentUser();
        setUser(user);
        return user;
      } catch (error) {
        clearUser();
        throw error;
      }
    },
    enabled: !!token, // 只有在有 token 时才请求
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 分钟
  });
}

/**
 * 登录 Hook
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => login(credentials),
    onSuccess: async (data) => {
      // 登录成功后获取用户信息和设置
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      await queryClient.invalidateQueries({ queryKey: ["userSettings"] });
      
      // 失效所有题目相关的查询，确保登录后重新获取带有 bestScore 的数据
      await queryClient.invalidateQueries({ queryKey: ["bankQuestions"] });
      await queryClient.invalidateQueries({ queryKey: ["question"] });
      await queryClient.invalidateQueries({ queryKey: ["questionCatalog"] });
    },
  });
}

/**
 * 注册 Hook
 */
export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) => register(data),
  });
}

/**
 * 登出 Hook
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const { clearUser } = useUserStore();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearUser();
      queryClient.clear();
    },
  });
}

