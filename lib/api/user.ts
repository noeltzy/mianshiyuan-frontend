import { apiClient } from "./client";
import type { ApiResponse } from "@/types";

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

