"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { listMyQuestions } from "@/lib/api/question";

const statusMap: Record<number, { label: string; className: string }> = {
  0: { label: "审核草稿", className: "bg-gray-100 text-gray-700" },
  1: { label: "审核待审核", className: "bg-yellow-100 text-yellow-700" },
  2: { label: "审核已通过", className: "bg-green-100 text-green-700" },
  3: { label: "审核已拒绝", className: "bg-red-100 text-red-700" },
};

const pageSize = 10;

export function MyQuestionsList() {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: questionsData, isLoading: questionsLoading } = useQuery({
    queryKey: ["myQuestions", currentPage],
    queryFn: () =>
      listMyQuestions({
        current: currentPage,
        size: pageSize,
      }),
  });

  const questions = questionsData?.records || [];
  const totalPages =
    questionsData?.pages ||
    (questionsData ? Math.ceil(questionsData.total / pageSize) : 0);

  return (
    <>
      {/* 加载状态 */}
      {questionsLoading ? (
        <div className="py-8 text-center text-gray-600">加载中...</div>
      ) : questions.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          <p>暂无创建的题目</p>
          <p className="text-sm mt-2">开始创建题目来展示您的作品吧！</p>
        </div>
      ) : (
        <div className="w-full">
          <table className="w-full table-fixed">
            <tbody className="bg-white divide-y divide-gray-200">
              {questions.map((question) => {
                const status =
                  question.status !== undefined
                    ? statusMap[question.status] || {
                        label: "未知",
                        className: "bg-gray-100 text-gray-600",
                      }
                    : {
                        label: "未知",
                        className: "bg-gray-100 text-gray-600",
                      };

                return (
                  <tr key={question.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 pr-2">
                      <Link
                        href={`/question/${question.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-primary hover:underline text-left block"
                      >
                        {question.id}. {question.title}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {question.answer || question.description || "暂无答案"}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right w-32">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
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
            第 {currentPage} / {totalPages} 页（共 {questionsData?.total || 0} 题）
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
