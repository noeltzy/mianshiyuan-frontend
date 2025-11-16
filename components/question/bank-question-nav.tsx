"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { getQuestionCatalog } from "@/lib/api/question";

interface BankQuestionNavProps {
  bankId: number;
  currentQuestionId: number;
}

export function BankQuestionNav({
  bankId,
  currentQuestionId,
}: BankQuestionNavProps) {
  // 获取题库题目目录（完整列表，无需分页）
  const { data: questions, isLoading } = useQuery({
    queryKey: ["questionCatalog", bankId],
    queryFn: () => getQuestionCatalog(bankId),
    enabled: !!bankId,
  });

  return (
    <div className="h-full w-80 border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900">题库题目</h3>
        {questions && (
          <p className="mt-1 text-sm text-gray-600">
            共 {questions.length} 道题
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-600">加载中...</div>
        ) : !questions || questions.length === 0 ? (
          <div className="p-4 text-center text-gray-500">暂无题目</div>
        ) : (
          <div className="p-2">
            {questions.map((question) => (
              <Link
                key={question.id}
                href={`/question/${question.id}?bankId=${bankId}`}
                className={`mb-2 block rounded-lg p-3 text-sm transition-colors ${
                  question.id === currentQuestionId
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                } `}
              >
                <div className="font-medium">
                  {question.id}. {question.title}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
