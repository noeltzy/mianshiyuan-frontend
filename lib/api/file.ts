import { apiClient } from "./client";
import type { ApiResponse, StsCredentials } from "@/types";

/**
 * 获取图片上传临时凭证
 */
export async function getImageUploadCredentials(): Promise<StsCredentials> {
  const response = await apiClient.get<ApiResponse<StsCredentials>>(
    "/file/sts-credentials/image"
  );
  return response.data.data;
}

/**
 * 获取 PDF 上传临时凭证
 */
export async function getPdfUploadCredentials(): Promise<StsCredentials> {
  const response = await apiClient.get<ApiResponse<StsCredentials>>(
    "/file/sts-credentials/pdf"
  );
  return response.data.data;
}