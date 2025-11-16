"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/layout/navbar";
import { Container } from "@/components/layout/container";
import { MarkdownAnswerEditor } from "@/components/questions/markdown-answer-editor";
import { cn } from "@/lib/utils";
import {
  createQuestion,
  updateQuestion,
  getQuestionById,
  type QuestionCreateRequest,
  type QuestionUpdateRequest,
} from "@/lib/api/question";
import { getAllTags } from "@/lib/api/bank";

interface AddQuestionPageProps {
  questionId?: number;
}

export function AddQuestionPage({ questionId }: AddQuestionPageProps) {
  const router = useRouter();
  const isEditMode = !!questionId;
  const [formData, setFormData] = useState<QuestionCreateRequest>({
    title: "",
    description: "",
    tagList: [],
    answer: "",
    difficulty: undefined,
    submitForReview: false,
  });
  const [tagInput, setTagInput] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 查询全部标签供选择
  const { data: tagOptions } = useQuery<string[]>({
    queryKey: ["allTags"],
    queryFn: getAllTags,
  });

  // 编辑模式下获取题目详情
  const { data: questionData, isLoading: isLoadingQuestion, error: questionError } = useQuery({
    queryKey: ["question", questionId],
    queryFn: () => getQuestionById(questionId!),
    enabled: isEditMode && !!questionId,
  });

  // 当获取到题目数据时，填充表单
  useEffect(() => {
    if (isEditMode && questionData) {
      setFormData({
        title: questionData.title || "",
        description: questionData.description || "",
        tagList: questionData.tagList || [],
        answer: questionData.answer || "",
        difficulty: questionData.difficulty,
        submitForReview: false, // 编辑时默认不勾选，让用户重新选择
      });
    }
  }, [questionData, isEditMode]);

  // 处理获取题目详情失败的情况
  useEffect(() => {
    if (isEditMode && questionError) {
      console.error("获取题目详情失败:", questionError);
      const error = questionError as any;
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "获取题目详情失败，请稍后重试";
      setFeedback({
        type: "error",
        message: errorMessage,
      });
      // 3秒后返回上一页
      const timer = setTimeout(() => {
        router.back();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [questionError, isEditMode, router]);

  const availableTags = (tagOptions ?? []).filter(
    (tag) => !formData.tagList?.includes(tag)
  );

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  // 创建题目
  const createMutation = useMutation({
    mutationFn: (data: QuestionCreateRequest) => createQuestion(data),
    onSuccess: () => {
      setFeedback({
        type: "success",
        message: "题目创建成功，正在跳转...",
      });
      redirectTimerRef.current = setTimeout(() => {
        router.push("/");
      }, 1500);
    },
    onError: (error: any) => {
      console.error("创建题目失败:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "创建题目失败，请稍后重试";
      setFeedback({
        type: "error",
        message: errorMessage,
      });
    },
  });

  // 更新题目
  const updateMutation = useMutation({
    mutationFn: (data: QuestionUpdateRequest) => updateQuestion(questionId!, data),
    onSuccess: () => {
      setFeedback({
        type: "success",
        message: "题目更新成功，正在跳转...",
      });
      redirectTimerRef.current = setTimeout(() => {
        router.back();
      }, 1500);
    },
    onError: (error: any) => {
      console.error("更新题目失败:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "更新题目失败，请稍后重试";
      setFeedback({
        type: "error",
        message: errorMessage,
      });
    },
  });

  const addTag = (tag: string) => {
    const normalized = tag.trim();
    if (!normalized) {
      return;
    }

    setFormData((prev) => {
      const currentTags = prev.tagList || [];
      if (currentTags.includes(normalized)) {
        return prev;
      }
      return {
        ...prev,
        tagList: [...currentTags, normalized],
      };
    });
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tagList: (prev.tagList || []).filter((item) => item !== tag),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
    }
    setFeedback(null);
    if (isEditMode) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  // 编辑模式下加载中
  if (isEditMode && isLoadingQuestion) {
    return (
      <>
        <Navbar />
        <Container variant="default" className="py-8">
          <div className="px-4 max-w-4xl mx-auto">
            <div className="text-center py-12">
              <p className="text-gray-600">加载题目详情中...</p>
            </div>
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container variant="default" className="py-8">
        <div className="px-4 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {isEditMode ? "编辑题目" : "添加题目"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    题目标题 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="请输入题目标题"
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    题目描述
                  </label>
                  <textarea
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="请输入题目描述或题干内容"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    难度
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="difficulty"
                        value="0"
                        checked={formData.difficulty === 0}
                        onChange={() =>
                          setFormData({ ...formData, difficulty: 0 })
                        }
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">简单</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="difficulty"
                        value="1"
                        checked={formData.difficulty === 1}
                        onChange={() =>
                          setFormData({ ...formData, difficulty: 1 })
                        }
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">中等</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="difficulty"
                        value="2"
                        checked={formData.difficulty === 2}
                        onChange={() =>
                          setFormData({ ...formData, difficulty: 2 })
                        }
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">困难</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="difficulty"
                        value=""
                        checked={formData.difficulty === undefined}
                        onChange={() =>
                          setFormData({ ...formData, difficulty: undefined })
                        }
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">不设置</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    标签
                  </label>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {formData.tagList && formData.tagList.length > 0 ? (
                        formData.tagList.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-1 rounded-full p-0.5 text-primary/70 transition hover:bg-primary/10 hover:text-primary"
                              aria-label={`移除标签 ${tag}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">暂未选择标签</span>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag(tagInput);
                          }
                        }}
                        placeholder="输入标签后点击添加，可添加新标签"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={() => addTag(tagInput)}
                        disabled={!tagInput.trim()}
                        className="sm:w-24"
                      >
                        添加
                      </Button>
                    </div>

                    {availableTags.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">
                          点击以下已有标签快速添加：
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {availableTags.map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => addTag(tag)}
                              className="rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-700 transition hover:bg-gray-100"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 答案 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                答案
              </label>
              <MarkdownAnswerEditor
                value={formData.answer || ""}
                onChange={(markdown) =>
                  setFormData({ ...formData, answer: markdown })
                }
                placeholder="请输入题目答案或解析，支持 Markdown 格式（可插入图片）"
                height={400}
              />
            </div>

            {/* 提交选项 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="submitForReview"
                  checked={formData.submitForReview}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      submitForReview: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label
                  htmlFor="submitForReview"
                  className="ml-2 text-sm text-gray-700"
                >
                  提交审核（勾选后状态为待审核，否则为草稿）
                </label>
              </div>
            </div>

            {/* 反馈提示 */}
            {feedback && (
              <div
                className={cn(
                  "rounded-lg border p-4",
                  feedback.type === "success"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-600"
                )}
              >
                <p className="text-sm">{feedback.message}</p>
              </div>
            )}

            {/* 提交按钮 */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="min-w-24"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "提交中..."
                  : "提交"}
              </Button>
            </div>
          </form>
        </div>
      </Container>
    </>
  );
}
