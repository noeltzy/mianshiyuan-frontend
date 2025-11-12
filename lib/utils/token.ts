import { AUTH_CONFIG } from "@/lib/config/auth";

/**
 * Token 管理工具
 * 统一管理 token 的存储和读取
 */

/**
 * 获取存储的 token
 */
export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(AUTH_CONFIG.TOKEN_STORAGE_KEY);
}

/**
 * 设置 token
 */
export function setToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(AUTH_CONFIG.TOKEN_STORAGE_KEY, token);
}

/**
 * 移除 token
 */
export function removeToken(): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(AUTH_CONFIG.TOKEN_STORAGE_KEY);
}

/**
 * 获取完整的 Authorization header 值
 * @returns "Bearer {token}" 或 null
 */
export function getAuthorizationHeader(): string | null {
  const token = getToken();
  if (!token) {
    return null;
  }
  return `${AUTH_CONFIG.TOKEN_PREFIX}${token}`;
}

