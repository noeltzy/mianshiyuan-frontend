import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { login, register, logout, getCurrentUser } from "@/lib/api/auth";
import { useUserStore } from "@/store/user-store";
import { getToken } from "@/lib/utils/token";
import type { LoginRequest, RegisterRequest } from "@/lib/api/auth";
import type { User } from "@/types";

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
    onSuccess: async () => {
      // 登录成功后获取用户信息
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
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

