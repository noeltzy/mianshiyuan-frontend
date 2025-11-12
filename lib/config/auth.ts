/**
 * 认证配置
 */
export const AUTH_CONFIG = {
  /** Token 存储的 key */
  TOKEN_STORAGE_KEY: "accessToken",
  /** Token 请求头字段名 */
  TOKEN_HEADER_NAME: "Authorization",
  /** Token 前缀 */
  TOKEN_PREFIX: "Bearer ",
} as const;

