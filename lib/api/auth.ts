import { apiClient } from "./client";
import { setToken, removeToken } from "@/lib/utils/token";
import type { ApiResponse } from "@/types";

/**
 * Token 响应类型
 */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * 登录请求参数
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * 注册请求参数
 */
export interface RegisterRequest {
  username: string;
  password: string;
  email?: string;
  phone?: string;
}

/**
 * 用户登录
 */
export async function login(credentials: LoginRequest): Promise<TokenResponse> {
  const response = await apiClient.post<ApiResponse<TokenResponse>>(
    "/auth/login",
    credentials
  );
  const { accessToken } = response.data.data;
  // 保存 token
  setToken(accessToken);
  return response.data.data;
}

/**
 * 用户登出
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post("/auth/logout");
  } finally {
    // 无论请求成功与否，都清除本地 token
    removeToken();
  }
}

/**
 * 用户注册
 */
export async function register(
  data: RegisterRequest
): Promise<ApiResponse<User>> {
  const response = await apiClient.post<ApiResponse<User>>(
    "/auth/register",
    data
  );
  return response.data;
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<ApiResponse<User>>("/auth/me");
  return response.data.data;
}

/**
 * 刷新 Token
 */
export async function refreshToken(): Promise<TokenResponse> {
  const response = await apiClient.post<ApiResponse<TokenResponse>>(
    "/auth/refresh"
  );
  const { accessToken } = response.data.data;
  // 更新 token
  setToken(accessToken);
  return response.data.data;
}

