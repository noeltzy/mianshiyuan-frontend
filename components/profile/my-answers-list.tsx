"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { listMyAnswers } from "@/lib/api/question";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { AnswerRatingVO } from "@/types";

const pageSize = 10;

// 截断文本
function truncateText(text: string, maxLength: number = 100): string {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + "...";
}

// 获取最佳评分
function getBestRating(ratings?: AnswerRatingVO[]): AnswerRatingVO | null {
  if (!ratings || ratings.length === 0) {
    return null;
  }
  return ratings.reduce((best, current) => {
    return current.score > best.score ? current : best;
  }, ratings[0]);
}

// 格式化时间
function formatTime(dateString?: string): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return "";
  }
}

export function MyAnswersList() {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: answersData, isLoading: answersLoading } = useQuery({
    queryKey: ["myAnswers", currentPage],
    queryFn: () =>
      listMyAnswers({
        current: currentPage,
        size: pageSize,
      }),
  });

  const answers = answersData?.records || [];
  const totalPages =
    answersData?.pages ||
    (answersData ? Math.ceil(answersData.total / pageSize) : 0);

  return (
    <>
      {/* 加载状态 */}
      {answersLoading ? (
        <div className="py-8 text-center text-gray-600">加载中...</div>
      ) : answers.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          <p>暂无回答的题目</p>
          <p className="text-sm mt-2">开始回答问题来展示您的答案吧！</p>
        </div>
      ) : (
        <div className="w-full">
          <table className="w-full table-fixed">
            <tbody className="bg-white divide-y divide-gray-200">
              {answers.map((item) => {
                const bestRating = getBestRating(item.answerRatingVOList);
                const ratings = item.answerRatingVOList || [];
                const hasRatings = ratings.length > 0;

                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 pr-2">
                      <Link
                        href={`/question/${item.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-primary hover:underline text-left block"
                      >
                        {item.id}. {item.title}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {bestRating
                          ? truncateText(bestRating.answer, 120)
                          : "暂无回答内容"}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* 最佳评分标签 */}
                        {bestRating ? (
                          <span className="rounded-full px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700">
                            最佳评分: {bestRating.score}分
                          </span>
                        ) : (
                          <span className="rounded-full px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600">
                            暂无评分
                          </span>
                        )}

                        {/* 下拉栏 */}
                        {hasRatings && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                                {ratings.length}条评分
                                <ChevronDown className="h-3 w-3" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-80 max-h-96 overflow-y-auto"
                            >
                              <div className="p-2">
                                <div className="text-sm font-semibold text-gray-900 mb-2">
                                  评分详情
                                </div>
                                <DropdownMenuSeparator className="mb-2" />
                                {ratings
                                  .sort((a, b) => b.score - a.score)
                                  .map((rating, index) => (
                                    <div key={index}>
                                      <div className="py-2">
                                        <div className="flex items-center justify-between mb-1">
                                          {rating.createdAt && (
                                            <span className="text-xs text-gray-500">
                                              {formatTime(rating.createdAt)}
                                            </span>
                                          )}
                                          {rating.score != null && rating.score > 0 && (
                                            <span className="text-sm font-medium text-gray-900">
                                              ⭐ {rating.score}分
                                            </span>
                                          )}
                                        </div>
                                        {rating.answer && (
                                          <div className="text-xs text-gray-600 mb-1 line-clamp-2">
                                            回答: {truncateText(rating.answer, 150)}
                                          </div>
                                        )}
                                        {rating.feedback && (
                                          <div className="text-xs text-gray-500">
                                            反馈: {truncateText(rating.feedback, 150)}
                                          </div>
                                        )}
                                      </div>
                                      {index < ratings.length - 1 && (
                                        <DropdownMenuSeparator className="my-1" />
                                      )}
                                    </div>
                                  ))}
                              </div>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            上一页
          </button>
          <span className="text-sm text-gray-600">
            第 {currentPage} / {totalPages} 页（共 {answersData?.total || 0} 题）
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      )}
    </>
  );
}

