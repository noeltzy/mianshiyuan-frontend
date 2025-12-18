import { apiClient } from "./client";
import type { ApiResponse, UserAnswerStatsVO } from "@/types";

export interface UpdateUserRequest {
  avatarUrl?: string;
  nickname?: string;
  email?: string;
  phone?: string;
}

export async function updateUserProfile(data: UpdateUserRequest): Promise<boolean> {
  const response = await apiClient.post<ApiResponse<boolean>>("/user/update", data);
  if (typeof response.data?.data === "boolean") {
    return response.data.data;
  }
  return true;
}

/**
 * 更新用户简历
 */
export async function updateResume(objectName: string): Promise<boolean> {
  const response = await apiClient.post<ApiResponse<boolean>>("/user/resume", {
    objectName,
  });
  return response.data.data;
}

/**
 * 更新用户求职档案
 */
export interface UpdateUserJobProfileRequest {
  skillTags?: string; // JSON 字符串数组，如 '["Java", "Spring"]'
  mainLanguage?: string;
  target?: string;
  targetLevel?: number; // 0=小厂, 1=中厂, 2=大厂
  targetType?: number; // 0=日常实习, 1=转正实习, 2=校招, 3=社招
}

export async function updateUserJobProfile(
  data: UpdateUserJobProfileRequest
): Promise<boolean> {
  const response = await apiClient.post<ApiResponse<boolean>>(
    "/user/profile",
    data
  );
  if (typeof response.data?.data === "boolean") {
    return response.data.data;
  }
  return true;
}

/**
 * 获取用户答题统计数据
 * @param userId 可选，不传则获取当前用户的统计
 */
export async function getUserAnswerStats(
  userId?: number
): Promise<UserAnswerStatsVO | null> {
  const params = userId ? { userId } : {};
  const response = await apiClient.get<ApiResponse<UserAnswerStatsVO>>(
    "/user/stats/answer",
    { params }
  );
  return response.data.data;
}

