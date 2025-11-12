// 用户相关类型
export interface User {
  id: number;
  username: string;
  avatarUrl?: string;
  email?: string;
  phone?: string;
  role?: "USER" | "ADMIN" | "REVIEWER";
}

// API 响应类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 题库相关类型（后端 API 返回）
export interface BankVO {
  id: number;
  name: string;
  description?: string;
  tagList?: string[];
  coverImage?: string;
  creatorId?: number;
  status?: number;
  reviewId?: number;
  createdAt?: string;
  updatedAt?: string;
}

// 分页响应类型
export interface PageBankVO {
  records: BankVO[];
  total: number;
  size: number;
  current: number;
  pages?: number;
}

// 前端使用的题库类型（兼容旧代码）
export interface QuestionBank {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  category: string;
  questionCount: number;
}

export interface QuestionCategory {
  id: string;
  name: string;
}

// 题库查询参数
export interface BankQueryParams {
  current?: number;
  size?: number;
  name?: string;
  tag?: string;
}

// OSS STS 凭证
export interface StsCredentials {
  accessKeyId: string;
  accessKeySecret: string;
  securityToken: string;
  expiration: string;
  ossHost: string;
  region: string;
  bucketName: string;
  pathPrefix?: string;
  folder?: string;
}

// 题目相关类型（后端 API 返回）
export interface QuestionVO {
  id: number;
  title: string;
  description?: string;
  tagList?: string[];
  answer?: string;
  difficulty?: number; // 0: 简单, 1: 中等, 2: 困难
  creatorId?: number;
  status?: number;
  isVipOnly?: number;
  favoriteCount?: number;
  viewCount?: number;
  reviewId?: number;
  createdAt?: string;
  updatedAt?: string;
}

// 分页题目响应类型
export interface PageQuestionVO {
  records: QuestionVO[];
  total: number;
  size: number;
  current: number;
  pages?: number;
}

// 题目查询参数
export interface QuestionQueryParams {
  current?: number;
  size?: number;
  title?: string;
  tag?: string;
  difficulty?: number;
}

// 前端使用的题目类型（兼容旧代码）
export interface Question {
  id: string;
  title: string;
  content: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
}

