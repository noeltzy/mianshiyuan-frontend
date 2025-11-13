"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import "@uiw/react-markdown-preview/markdown.css";
import { getQuestionById } from "@/lib/api/question";
import { Button } from "@/components/ui/button";
import { Tags, Heart, Eye } from "lucide-react";

const MarkdownPreview = dynamic(() => import("@uiw/react-markdown-preview"), {
  ssr: false,
});

interface QuestionDetailProps {
  questionId: number;
}

export function QuestionDetail({ questionId }: QuestionDetailProps) {
  const [showAnswer, setShowAnswer] = useState(true);

  const {
    data: question,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["question", questionId],
    queryFn: () => getQuestionById(questionId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600">加载失败</p>
          <p className="mt-2 text-gray-600">
            {error instanceof Error ? error.message : "未知错误"}
          </p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">题目不存在</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 信息简介区 */}
      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{question.title}</h1>
          <p className="mt-2 text-base text-gray-600">
            {question.description || "暂无描述"}
          </p>
        </div>

        <div className="border-t border-gray-200" />

        <div className="flex flex-wrap items-center gap-3">
          <Tags className="h-4 w-4 text-gray-500" />
          {question.tagList && question.tagList.length > 0 ? (
            question.tagList.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-400">暂无标签</span>
          )}
        </div>

        <div className="border-t border-gray-200" />

        <div className="flex items-center gap-6 text-sm text-gray-600">
          <span className="inline-flex items-center gap-1">
            <Heart className="h-4 w-4" /> {question.favoriteCount ?? 0}
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye className="h-4 w-4" /> {question.viewCount ?? 0}
          </span>
        </div>
      </div>

      {/* 答案区域 */}
      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">答案解析</h2>
          <Button variant="outline" onClick={() => setShowAnswer((prev) => !prev)}>
            {showAnswer ? "隐藏答案" : "显示答案"}
          </Button>
        </div>
        <div className="border-t border-gray-200" />
        {showAnswer ? (
          question.answer ? (
            <div data-color-mode="light" className="markdown-preview-container">
              <MarkdownPreview source={question.answer} />
            </div>
          ) : (
            <span className="text-sm text-gray-400">暂无答案</span>
          )
        ) : (
          <div className="text-sm text-gray-500">答案已隐藏</div>
        )}
      </div>
    </div>
  );
}


