import type { StsCredentials } from "@/types";

let ossModulePromise: Promise<typeof import("ali-oss")> | null = null;

async function loadOssModule() {
  if (!ossModulePromise) {
    ossModulePromise = import("ali-oss");
  }
  return ossModulePromise;
}

/**
 * 清理OSS host，移除协议前缀
 */
function normalizeOssHost(ossHost: string): string {
  let host = ossHost.replace(/^https?:\/\//i, "");
  host = host.replace(/\/+$/, "");
  return host;
}

/**
 * 根据region构建标准OSS endpoint
 */
function buildOssEndpoint(region: string): string {
  if (region.includes(".")) {
    return region;
  }
  return `oss-${region}.aliyuncs.com`;
}

/**
 * 验证host是否为有效的域名格式
 */
function isValidDomain(host: string): boolean {
  const domainRegex =
    /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  return domainRegex.test(host);
}

/**
 * 构建对象键（Object Key）
 */
function buildObjectKey(
  fileName: string,
  pathPrefix?: string,
  folder?: string
): string {
  const sanitizedName = fileName.replace(/\s+/g, "-");
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).slice(2, 8);

  const segments = [pathPrefix, folder]
    .filter((segment) => !!segment && segment.trim().length > 0)
    .map((segment) => segment!.replace(/^\/+|\/+$|\s+/g, ""));

  const basePath = segments.length > 0 ? `${segments.join("/")}/` : "";
  return `${basePath}${timestamp}-${randomSuffix}-${sanitizedName}`;
}

export interface UploadPdfResult {
  objectName: string;
  url: string;
}

/**
 * 上传 PDF 到 OSS
 * @returns objectName 和完整 URL
 */
export async function uploadPdfToOss(
  file: File,
  credentials: StsCredentials
): Promise<UploadPdfResult> {
  const OSS = (await loadOssModule()).default;

  let normalizedHost = normalizeOssHost(credentials.ossHost);

  if (!isValidDomain(normalizedHost)) {
    console.warn(
      `ossHost "${credentials.ossHost}" 不是有效的域名格式，将使用region "${credentials.region}" 构建标准OSS endpoint`
    );
    normalizedHost = buildOssEndpoint(credentials.region);
  }

  const config: Record<string, unknown> = {
    accessKeyId: credentials.accessKeyId,
    accessKeySecret: credentials.accessKeySecret,
    stsToken: credentials.securityToken,
    bucket: credentials.bucketName,
  };

  if (normalizedHost.includes("aliyuncs.com")) {
    config.region = credentials.region;
  } else {
    config.endpoint = normalizedHost;
    config.secure = true;
  }

  const client = new OSS(config);

  const objectKey = buildObjectKey(
    file.name,
    credentials.pathPrefix,
    credentials.folder
  );

  try {
    const result = await client.put(objectKey, file, {
      headers: {
        "Content-Type": file.type || "application/pdf",
      },
    });

    let url = "";
    if (result.url) {
      if (
        result.url.startsWith("http://") ||
        result.url.startsWith("https://")
      ) {
        url = result.url;
      } else {
        url = `https://${result.url}`;
      }
    } else {
      url = `https://${normalizedHost}/${objectKey}`;
    }

    return {
      objectName: objectKey,
      url,
    };
  } catch (error) {
    console.error("OSS PDF上传错误:", error);
    throw new Error(
      `PDF上传失败: ${error instanceof Error ? error.message : "未知错误"}`
    );
  }
}

