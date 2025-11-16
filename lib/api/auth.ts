import { apiClient } from "./client";
import { setToken, removeToken } from "@/lib/utils/token";
import type { ApiResponse, User } from "@/types";

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
  
  // 检查响应数据
  if (!response.data?.data) {
    throw new Error(response.data?.message || "登录失败，请检查用户名和密码");
  }
  
  const { accessToken } = response.data.data;
  
  // 检查 accessToken 是否存在
  if (!accessToken) {
    throw new Error("登录响应中缺少访问令牌");
  }
  
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
  
  // 检查响应数据
  if (!response.data?.data) {
    throw new Error(response.data?.message || "获取用户信息失败");
  }
  
  return response.data.data;
}

/**
 * 刷新 Token
 */
export async function refreshToken(): Promise<TokenResponse> {
  const response = await apiClient.post<ApiResponse<TokenResponse>>(
    "/auth/refresh"
  );
  
  // 检查响应数据
  if (!response.data?.data) {
    throw new Error(response.data?.message || "刷新令牌失败");
  }
  
  const { accessToken } = response.data.data;
  
  // 检查 accessToken 是否存在
  if (!accessToken) {
    throw new Error("刷新响应中缺少访问令牌");
  }
  
  // 更新 token
  setToken(accessToken);
  return response.data.data;
}

