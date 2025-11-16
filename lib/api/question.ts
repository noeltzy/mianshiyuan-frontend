import { apiClient } from "./client";
import type {
  ApiResponse,
  PageQuestionVO,
  QuestionQueryParams,
  QuestionVO,
  QuestionCatalogItemVO,
  CommentVO,
  PageRequest,
  PageQuestionAnswerVO,
} from "@/types";

/**
 * 分页查询题目列表
 * @param params 查询参数
 */
export async function listQuestions(
  params?: QuestionQueryParams
): Promise<PageQuestionVO> {
  const response = await apiClient.get<ApiResponse<PageQuestionVO>>(
    "/question",
    {
      params: {
        current: params?.current || 1,
        size: params?.size || 10,
        title: params?.title,
        tag: params?.tag,
        difficulty: params?.difficulty,
        bankId: params?.bankId,
      },
    }
  );
  return response.data.data;
}

/**
 * 根据 ID 获取题目详情
 */
export async function getQuestionById(id: number): Promise<QuestionVO> {
  const response = await apiClient.get<ApiResponse<QuestionVO>>(
    `/question/${id}`
  );
  return response.data.data;
}

/**
 * 创建题目（需要登录）
 */
export interface QuestionCreateRequest {
  title: string;
  description?: string;
  tagList?: string[];
  answer?: string;
  difficulty?: number; // 0: 简单, 1: 中等, 2: 困难
  submitForReview?: boolean;
}

export async function createQuestion(
  data: QuestionCreateRequest
): Promise<ApiResponse<QuestionVO>> {
  const response = await apiClient.post<ApiResponse<QuestionVO>>(
    "/question",
    data
  );
  return response.data;
}

/**
 * 更新题目（需要登录）
 */
export interface QuestionUpdateRequest {
  title: string;
  description?: string;
  tagList?: string[];
  answer?: string;
  difficulty?: number; // 0: 简单, 1: 中等, 2: 困难
  submitForReview?: boolean;
}

export async function updateQuestion(
  id: number,
  data: QuestionUpdateRequest
): Promise<ApiResponse<QuestionVO>> {
  const response = await apiClient.put<ApiResponse<QuestionVO>>(
    `/question/${id}`,
    data
  );
  return response.data;
}

/**
 * 批量绑定题目到题库（管理员）
 */
export interface QuestionBatchBindRequest {
  bankId: number;
  questionIdList: number[];
}

export interface BankQuestionQueryParams {
  bankId: number;
  current?: number;
  size?: number;
}

export interface QuestionBatchUnbindRequest {
  bankId: number;
  questionIdList: number[];
}

export async function bindQuestionsToBank(
  data: QuestionBatchBindRequest
): Promise<ApiResponse<boolean>> {
  const response = await apiClient.post<ApiResponse<boolean>>(
    "/question/bind",
    data
  );
  return response.data;
}

export async function listBankQuestions(
  params: BankQuestionQueryParams
): Promise<PageQuestionVO> {
  const response = await apiClient.get<ApiResponse<PageQuestionVO>>(
    "/question",
    {
      params: {
        bankId: params.bankId,
        current: params.current || 1,
        size: params.size || 10,
      },
    }
  );
  return response.data.data;
}

export async function unbindQuestionsFromBank(
  data: QuestionBatchUnbindRequest
): Promise<ApiResponse<boolean>> {
  const response = await apiClient.post<ApiResponse<boolean>>(
    "/question/unbind",
    data
  );
  return response.data;
}

/**
 * 获取题库内题目目录（包含题目ID和标题）
 * @param bankId 题库ID
 */
export async function getQuestionCatalog(
  bankId: number
): Promise<QuestionCatalogItemVO[]> {
  const response = await apiClient.get<ApiResponse<QuestionCatalogItemVO[]>>(
    "/question/catalog",
    {
      params: {
        id: bankId,
      },
    }
  );
  return response.data.data;
}

/**
 * 分页查询我创建的题目（需要登录）
 * @param params 分页参数
 */
export async function listMyQuestions(
  params?: PageRequest
): Promise<PageQuestionVO> {
  const response = await apiClient.get<ApiResponse<PageQuestionVO>>(
    "/question/my",
    {
      params: {
        current: params?.current || 1,
        size: params?.size || 10,
      },
    }
  );
  return response.data.data;
}

/**
 * 分页查询我回答的题目以及答案（需要登录）
 * @param params 分页参数
 */
export async function listMyAnswers(
  params?: PageRequest
): Promise<PageQuestionAnswerVO> {
  const response = await apiClient.get<ApiResponse<PageQuestionAnswerVO>>(
    "/question/answer",
    {
      params: {
        current: params?.current || 1,
        size: params?.size || 10,
      },
    }
  );
  return response.data.data;
}

/**
 * 获取题目评论列表（需要登录）
 * @param questionId 题目ID
 */
export async function getQuestionComments(
  questionId: number
): Promise<CommentVO[]> {
  const response = await apiClient.get<ApiResponse<CommentVO[]>>(
    `/question/${questionId}/comments`
  );
  return response.data.data;
}

/**
 * 提交题目答案（需要登录）
 * @param questionId 题目ID
 * @param content 答案内容
 */
export async function submitQuestionAnswer(
  questionId: number,
  content: string
): Promise<ApiResponse<string>> {
  const response = await apiClient.post<ApiResponse<string>>(
    `/comment`,
    {
      questionId,
      content,
      commentType: 1, // 1表示答案
    }
  );
  return response.data;
}

/**
 * 提交题目评论（需要登录）
 * @param questionId 题目ID
 * @param content 评论内容
 * @param parentId 回复的评论ID，可选
 */
export async function submitQuestionComment(
  questionId: number,
  content: string,
  parentId?: number,
  commentType: number = 2 // 默认是评论类型
): Promise<ApiResponse<string>> {
  const response = await apiClient.post<ApiResponse<string>>(
    `/comment`,
    {
      questionId,
      content,
      commentType,
      parentId,
    }
  );
  return response.data;
}