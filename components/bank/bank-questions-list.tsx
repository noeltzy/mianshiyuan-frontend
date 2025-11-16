"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { listQuestions } from "@/lib/api/question";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface BankQuestionsListProps {
  bankId: number;
}

const difficultyMap: Record<number, { label: string; className: string }> = {
  0: { label: "简单", className: "bg-emerald-100 text-emerald-700" },
  1: { label: "中等", className: "bg-blue-100 text-blue-700" },
  2: { label: "困难", className: "bg-purple-100 text-purple-700" },
};

const pageSize = 10;

export function BankQuestionsList({ bankId }: BankQuestionsListProps) {
  const [searchTitle, setSearchTitle] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: questionsData, isLoading: questionsLoading } = useQuery({
    queryKey: ["bankQuestions", bankId, currentPage, searchTitle],
    queryFn: () =>
      listQuestions({
        current: currentPage,
        size: pageSize,
        title: searchTitle.trim() || undefined,
        bankId: bankId,
      }),
    enabled: !!bankId,
  });

  const questions = questionsData?.records || [];
  const totalPages =
    questionsData?.pages ||
    (questionsData ? Math.ceil(questionsData.total / pageSize) : 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* 题目列表头部 */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">题目列表</h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="search"
            placeholder="搜索题目名称..."
            value={searchTitle}
            onChange={(e) => {
              setSearchTitle(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>
      </div>

      {/* 题目列表内容 */}
      {questionsLoading ? (
        <div className="py-8 text-center text-gray-600">加载中...</div>
      ) : questions.length === 0 ? (
        <div className="py-8 text-center text-gray-500">暂无题目</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  题目名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  难度
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  标签
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {questions.map((question) => {
                const difficulty =
                  question.difficulty !== undefined
                    ? difficultyMap[question.difficulty] || {
                        label: "未设置",
                        className: "bg-gray-100 text-gray-600",
                      }
                    : {
                        label: "未设置",
                        className: "bg-gray-100 text-gray-600",
                      };

                return (
                  <tr key={question.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <Link
                        href={`/question/${question.id}?bankId=${bankId}`}
                        className="text-primary hover:underline"
                      >
                        {question.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${difficulty.className}`}
                      >
                        {difficulty.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {question.tagList && question.tagList.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {question.tagList.map((tag, index) => (
                            <span
                              key={index}
                              className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">暂无标签</span>
                      )}
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
    </div>
  );
}

