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
  // 移除 http:// 或 https:// 前缀
  let host = ossHost.replace(/^https?:\/\//i, "");
  // 移除末尾的斜杠
  host = host.replace(/\/+$/, "");
  return host;
}

/**
 * 根据region构建标准OSS endpoint
 */
function buildOssEndpoint(region: string): string {
  // 如果region已经是完整域名，直接返回
  if (region.includes(".")) {
    return region;
  }
  // 否则构建标准OSS域名格式：oss-{region}.aliyuncs.com
  // region格式通常是：cn-hangzhou, cn-beijing等
  return `oss-${region}.aliyuncs.com`;
}

/**
 * 验证host是否为有效的域名格式
 */
function isValidDomain(host: string): boolean {
  // 简单的域名验证：至少包含一个点和有效的字符
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
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

/**
 * 上传图片到OSS
 */
export async function uploadImageToOss(
  file: File,
  credentials: StsCredentials
): Promise<string> {
  const OSS = (await loadOssModule()).default;

  // 清理并规范化ossHost
  let normalizedHost = normalizeOssHost(credentials.ossHost);

  // 验证ossHost是否为有效域名
  // 如果ossHost无效（如 "teng-oss.https"），则使用region构建标准endpoint
  if (!isValidDomain(normalizedHost)) {
    console.warn(
      `ossHost "${credentials.ossHost}" 不是有效的域名格式，将使用region "${credentials.region}" 构建标准OSS endpoint`
    );
    normalizedHost = buildOssEndpoint(credentials.region);
  }

  // 构建OSS客户端配置
  // 注意：ali-oss的配置方式：
  // 1. 标准OSS域名：只需要设置 region 和 bucket，不需要设置 endpoint
  // 2. 自定义域名：需要设置 endpoint 和 bucket，不需要设置 region（或设置为空）
  const config: any = {
    accessKeyId: credentials.accessKeyId,
    accessKeySecret: credentials.accessKeySecret,
    stsToken: credentials.securityToken,
    bucket: credentials.bucketName,
  };

  // 判断是标准OSS域名还是自定义域名
  if (normalizedHost.includes("aliyuncs.com")) {
    // 标准OSS域名，使用region参数，不使用endpoint
    config.region = credentials.region;
    console.log("使用标准OSS域名，region:", credentials.region);
  } else {
    // 自定义域名，使用endpoint参数，不设置region
    config.endpoint = normalizedHost;
    config.secure = true; // 使用HTTPS
    // 如果使用自定义域名，可能需要设置cname
    // config.cname = true;
    console.log("使用自定义域名，endpoint:", normalizedHost);
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
        "Content-Type": file.type || "application/octet-stream",
      },
    });

    // 返回上传后的URL
    if (result.url) {
      // 如果返回的URL不包含协议，添加https://
      if (result.url.startsWith("http://") || result.url.startsWith("https://")) {
        return result.url;
      }
      return `https://${result.url}`;
    }

    // 如果没有返回URL，构建一个
    // 使用bucket域名或自定义域名
    const urlHost = normalizedHost;
    return `https://${urlHost}/${objectKey}`;
  } catch (error) {
    console.error("OSS上传错误:", {
      error,
      credentials: {
        ...credentials,
        accessKeyId: credentials.accessKeyId.substring(0, 4) + "***",
        accessKeySecret: "***",
        securityToken: credentials.securityToken.substring(0, 10) + "***",
      },
      objectKey,
      normalizedHost,
      config: {
        ...config,
        accessKeyId: config.accessKeyId.substring(0, 4) + "***",
        accessKeySecret: "***",
        stsToken: config.stsToken.substring(0, 10) + "***",
      },
    });
    throw new Error(
      `OSS上传失败: ${
        error instanceof Error ? error.message : "未知错误"
      }。请检查：1. OSS配置是否正确 2. CORS是否已配置 3. STS凭证是否有效`
    );
  }
}
