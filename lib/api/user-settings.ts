import { apiClient } from "./client";
import type { ApiResponse, UserSetting } from "@/types";

export async function getUserSettings(): Promise<UserSetting[]> {
  const response = await apiClient.get<ApiResponse<UserSetting[]>>("/user/settings");
  return response.data.data ?? [];
}

export async function updateUserSettings(settings: UserSetting[]): Promise<boolean> {
  const response = await apiClient.post<ApiResponse<boolean>>("/user/settings", settings);
  if (typeof response.data?.data === "boolean") {
    return response.data.data;
  }
  return true;
}

