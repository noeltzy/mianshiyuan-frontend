import { apiClient } from "./client";
import type {
  ApiResponse,
  PageBankVO,
  BankQueryParams,
  BankVO,
} from "@/types";

/**
 * 获取所有标签列表
 */
export async function getAllTags(): Promise<string[]> {
  const response = await apiClient.get<ApiResponse<string[]>>("/bank/tags");
  return response.data.data;
}

/**
 * 分页查询题库列表
 * @param params 查询参数
 */
export async function listBanks(
  params?: BankQueryParams
): Promise<PageBankVO> {
  const response = await apiClient.get<ApiResponse<PageBankVO>>("/bank", {
    params: {
      current: params?.current || 1,
      size: params?.size || 10,
      name: params?.name,
      tag: params?.tag,
    },
  });
  return response.data.data;
}

/**
 * 根据 ID 获取题库详情
 */
export async function getBankById(id: number) {
  const response = await apiClient.get(`/bank/${id}`);
  return response.data;
}

/**
 * 创建题库（需要管理员权限）
 */
export interface BankCreateRequest {
  name: string;
  description?: string;
  coverImage?: string;
  tagList?: string[];
  submitForReview?: boolean;
}

export async function createBank(
  data: BankCreateRequest
): Promise<ApiResponse<BankVO>> {
  const response = await apiClient.post<ApiResponse<BankVO>>("/bank", data);
  return response.data;
}

/**
 * 更新题库（需要管理员权限）
 */
export interface BankUpdateRequest {
  name: string;
  description?: string;
  coverImage?: string;
  tagList?: string[];
  submitForReview?: boolean;
}

export async function updateBank(
  id: number,
  data: BankUpdateRequest
): Promise<ApiResponse<BankVO>> {
  const response = await apiClient.put<ApiResponse<BankVO>>(
    `/bank/${id}`,
    data
  );
  return response.data;
}

