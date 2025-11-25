"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "@uiw/react-markdown-preview/markdown.css";
import { getQuestionById, getQuestionCatalog } from "@/lib/api/question";
import { useCurrentUser, useUserSettings } from "@/hooks/use-auth";
import { useUserStore } from "@/store/user-store";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { AnswerDialog } from "@/components/question/answer-dialog";
import { QuestionComments } from "@/components/question/question-comments";
import { Button } from "@/components/ui/button";
import {
  Tags,
  Heart,
  Eye,
  Lock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const MarkdownPreview = dynamic(() => import("@uiw/react-markdown-preview"), {
  ssr: false,
});

interface QuestionDetailProps {
  questionId: number;
  bankId?: string | number;
}

export function QuestionDetail({ questionId, bankId }: QuestionDetailProps) {
  const [showAnswerDialog, setShowAnswerDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [commentsRefetch, setCommentsRefetch] = useState<(() => void) | null>(
    null
  );
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlBankId = searchParams.get("bankId");

  // 获取当前用户登录状态和设置
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const { isLoading: settingsLoading } = useUserSettings();
  const { settings, settingsLoaded } = useUserStore();
  const isLoggedIn = !!currentUser;

  // 获取用户设置：默认是否显示答案
  const defaultShowAnswer = settings.showAnswer === "true";

  // 计算初始显示答案状态
  const [showAnswer, setShowAnswer] = useState(() => {
    if (!isLoggedIn) {
      // 未登录用户默认不显示答案
      return false;
    }
    // 登录用户根据设置决定，如果未设置则默认不显示
    return defaultShowAnswer;
  });

  // 当设置加载完成后，重新计算显示状态
  useEffect(() => {
    if (isLoggedIn && !settingsLoading) {
      setShowAnswer(defaultShowAnswer);
    }
  }, [isLoggedIn, settingsLoading, defaultShowAnswer]);

  // 专门监听设置变化，当设置更新时立即响应
  useEffect(() => {
    if (isLoggedIn && settingsLoaded) {
      // 只有当 settings 实际有变化时才更新
      setShowAnswer((prevAnswer) => {
        const shouldShow = defaultShowAnswer;
        if (prevAnswer !== shouldShow) {
          return shouldShow;
        }
        return prevAnswer;
      });
    }
  }, [isLoggedIn, settingsLoaded, settings.showAnswer, defaultShowAnswer]);

  // 使用传入的bankId或URL中的bankId
  const currentBankId = bankId
    ? Number(bankId)
    : urlBankId
      ? Number(urlBankId)
      : null;

  // 查询题目详情
  const {
    data: question,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["question", questionId],
    queryFn: () => getQuestionById(questionId),
  });

  // 如果有bankId，查询题库题目目录用于验证
  const { data: bankQuestionCatalog, isLoading: bankQuestionsLoading } =
    useQuery({
      queryKey: ["questionCatalog", currentBankId],
      queryFn: () => getQuestionCatalog(currentBankId!),
      enabled: !!currentBankId,
    });

  // 检查当前题目是否在题库中
  const isQuestionInBank =
    currentBankId && bankQuestionCatalog
      ? bankQuestionCatalog.some((q) => q.id === questionId)
      : true;

  // 计算上一题和下一题
  let prevQuestion = null;
  let nextQuestion = null;

  if (currentBankId && bankQuestionCatalog && bankQuestionCatalog.length > 0) {
    const currentIndex = bankQuestionCatalog.findIndex(
      (q) => q.id === questionId
    );

    if (currentIndex > 0) {
      prevQuestion = bankQuestionCatalog[currentIndex - 1];
    }

    if (currentIndex < bankQuestionCatalog.length - 1) {
      nextQuestion = bankQuestionCatalog[currentIndex + 1];
    }
  }

  // 处理题目跳转
  const handleQuestionJump = (targetQuestionId: number) => {
    if (currentBankId) {
      router.push(`/question/${targetQuestionId}?bankId=${currentBankId}`);
    } else {
      router.push(`/question/${targetQuestionId}`);
    }
  };

  // 如果用户信息或设置正在加载，显示加载状态
  if (
    userLoading ||
    (isLoggedIn && settingsLoading) ||
    isLoading ||
    (currentBankId && bankQuestionsLoading)
  ) {
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

  // 如果有bankId但当前题目不在题库中，显示错误页面
  if (currentBankId && !isQuestionInBank) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="max-w-md text-center">
          <div className="mb-4 text-6xl">😵</div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            系统好像出问题了
          </h2>
          <p className="mb-6 text-gray-600">抱歉，该题目不在当前题库中</p>
          <div className="space-x-4">
            <Button variant="outline" onClick={() => window.history.back()}>
              返回上一页
            </Button>
            <Button onClick={() => (window.location.href = "/")}>
              返回主页
            </Button>
          </div>
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
    <>
      <div className="space-y-6">
        {/* 信息简介区 */}
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {question.title}
            </h1>
            <div className="my-4 border-t border-gray-200" />
            <p className="text-base text-gray-600">
              {question.description || "暂无描述"}
            </p>
          </div>

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
            <div className="flex items-center gap-2">
              {isLoggedIn && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (isLoggedIn) {
                      setShowAnswerDialog(true);
                    } else {
                      setShowAuthDialog(true);
                    }
                  }}
                >
                  我要回答
                </Button>
              )}
              <Button
                variant="outline"
                title="可在用户中心设置默认是否显示"
                onClick={() => setShowAnswer((prev) => !prev)}
              >
                {showAnswer ? "隐藏答案" : "显示答案"}
              </Button>
            </div>
          </div>
          <div className="border-t border-gray-200" />
          {showAnswer ? (
            question.answer ? (
              <div
                data-color-mode="light"
                className="markdown-preview-container"
              >
                <MarkdownPreview source={question.answer} />
              </div>
            ) : (
              <span className="text-sm text-gray-400">暂无答案</span>
            )
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Lock className="h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-500">答案已隐藏</p>
              <Button
                variant="outline"
                size="sm"
                title="可在用户中心设置默认是否显示"
                onClick={() => {
                  if (isLoggedIn) {
                    setShowAnswer(true);
                  } else {
                    // 未登录用户点击时显示登录对话框
                    setShowAuthDialog(true);
                  }
                }}
              >
                {isLoggedIn ? "查看答案" : "登录后查看答案"}
              </Button>
            </div>
          )}
        </div>

        {/* 上一题/下一题导航 */}
        {currentBankId && (prevQuestion || nextQuestion) && (
          <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            {/* 上一题/下一题按钮行 */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {prevQuestion && (
                  <Button
                    variant="outline"
                    onClick={() => handleQuestionJump(prevQuestion.id)}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    上一题
                  </Button>
                )}
              </div>

              <div className="flex-1 text-right">
                {nextQuestion && (
                  <Button
                    variant="outline"
                    onClick={() => handleQuestionJump(nextQuestion.id)}
                    className="ml-auto flex items-center gap-2"
                  >
                    下一题
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 评论模块 - 在翻页模块后添加适当间距 */}
        <div
          className={
            currentBankId && (prevQuestion || nextQuestion) ? "mt-6" : ""
          }
        >
          <QuestionComments
            questionId={questionId}
            ref={(ref: { refetch?: () => void } | null) => {
              if (ref && typeof ref.refetch === "function") {
                setCommentsRefetch(() => ref.refetch);
              }
            }}
          />
        </div>
      </div>

      {/* 登录对话框 */}
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />

      {/* 回答对话框 */}
      {question && (
        <AnswerDialog
          open={showAnswerDialog}
          onOpenChange={setShowAnswerDialog}
          questionId={questionId}
          questionTitle={question.title}
          refetchComments={commentsRefetch || undefined}
          onSubmitSuccess={() => {
            // 可以在这里刷新评论数据
            console.log("答案提交成功");
          }}
        />
      )}
    </>
  );
}
