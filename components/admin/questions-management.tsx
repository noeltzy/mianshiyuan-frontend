"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { listQuestions, bindQuestionsToBank } from "@/lib/api/question";
import type { QuestionBatchBindRequest } from "@/lib/api/question";

const pageSize = 10;

const difficultyMap: Record<number, { label: string; className: string }> = {
  0: { label: "简单", className: "bg-emerald-100 text-emerald-700" },
  1: { label: "中等", className: "bg-blue-100 text-blue-700" },
  2: { label: "困难", className: "bg-purple-100 text-purple-700" },
};

const statusMap: Record<number, { label: string; className: string }> = {
  0: { label: "草稿", className: "bg-gray-100 text-gray-700" },
  1: { label: "待审核", className: "bg-yellow-100 text-yellow-700" },
  2: { label: "已发布", className: "bg-green-100 text-green-700" },
  3: { label: "已拒绝", className: "bg-red-100 text-red-700" },
};

const difficultyFilterOptions = [
  { value: "", label: "全部难度" },
  { value: "0", label: "简单" },
  { value: "1", label: "中等" },
  { value: "2", label: "困难" },
];

export function QuestionsManagement() {
  const [searchTitle, setSearchTitle] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bindDialogOpen, setBindDialogOpen] = useState(false);
  const [bankId, setBankId] = useState("");
  const [bindError, setBindError] = useState<string | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [filterBankId, setFilterBankId] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [
      "adminQuestions",
      currentPage,
      searchTitle,
      filterDifficulty,
      filterTag,
      filterBankId,
    ],
    queryFn: () => {
      const titleParam = searchTitle.trim();
      const difficultyParam = filterDifficulty
        ? Number(filterDifficulty)
        : undefined;
      const tagParam = filterTag.trim();
      const bankIdParam = filterBankId.trim();

      return listQuestions({
        current: currentPage,
        size: pageSize,
        title: titleParam || undefined,
        difficulty: difficultyParam,
        tag: tagParam || undefined,
        bankId: bankIdParam ? Number(bankIdParam) : undefined,
      });
    },
  });

  // 切换页面或搜索时清空选中项
  useEffect(() => {
    setSelectedIds(new Set());
  }, [currentPage, searchTitle, filterDifficulty, filterTag, filterBankId]);

  const totalPages =
    data?.pages || (data ? Math.ceil(data.total / pageSize) : 0);

  // 绑定题目到题库
  const bindMutation = useMutation({
    mutationFn: (data: QuestionBatchBindRequest) => bindQuestionsToBank(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminQuestions"] });
      setBindDialogOpen(false);
      setSelectedIds(new Set());
      setBankId("");
      setBindError(null);
    },
    onError: (error: any) => {
      setBindError(
        error?.response?.data?.message || error?.message || "绑定失败，请稍后重试"
      );
    },
  });

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked && data?.records) {
      setSelectedIds(new Set(data.records.map((q) => q.id!)));
    } else {
      setSelectedIds(new Set());
    }
  };

  // 单个选择
  const handleSelectOne = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  // 处理绑定
  const handleBind = () => {
    setBindError(null);
    const bankIdNum = parseInt(bankId, 10);
    if (!bankIdNum || isNaN(bankIdNum) || bankIdNum <= 0) {
      setBindError("请输入有效的题库ID（正整数）");
      return;
    }
    if (selectedIds.size === 0) {
      setBindError("请至少选择一个题目");
      return;
    }
    bindMutation.mutate({
      bankId: bankIdNum,
      questionIdList: Array.from(selectedIds),
    });
  };

  // 检查是否全选
  const isAllSelected =
    data?.records && data.records.length > 0
      ? data.records.every((q) => selectedIds.has(q.id!))
      : false;

  // 检查是否有部分选中
  const isIndeterminate =
    data?.records &&
    data.records.length > 0 &&
    data.records.some((q) => selectedIds.has(q.id!)) &&
    !isAllSelected;

  const handleResetFilters = () => {
    setSearchTitle("");
    setFilterDifficulty("");
    setFilterTag("");
    setFilterBankId("");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">题目管理</h1>
          <p className="mt-2 text-gray-600">查看并管理题目列表（不显示答案）</p>
        </div>
        {selectedIds.size > 0 && (
          <Button
            onClick={() => {
              setBindDialogOpen(true);
              setBindError(null);
            }}
            disabled={bindMutation.isPending}
          >
            添加到题库 ({selectedIds.size})
          </Button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="search"
              placeholder="搜索题目标题..."
              value={searchTitle}
              onChange={(event) => {
                setSearchTitle(event.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <select
              value={filterDifficulty}
              onChange={(event) => {
                setFilterDifficulty(event.target.value);
                setCurrentPage(1);
              }}
              className="filter-control"
            >
              {difficultyFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Input
              placeholder="标签（精确匹配）"
              value={filterTag}
              onChange={(event) => {
                setFilterTag(event.target.value);
                setCurrentPage(1);
              }}
              className="filter-control w-40"
            />
            <Input
              type="number"
              placeholder="题库ID"
              value={filterBankId}
              onChange={(event) => {
                setFilterBankId(event.target.value);
                setCurrentPage(1);
              }}
              className="filter-control w-32"
              min={0}
            />
            <Button
              variant="outline"
              onClick={handleResetFilters}
              disabled={
                !searchTitle && !filterDifficulty && !filterTag && !filterBankId
              }
            >
              重置
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-600">加载中...</div>
        ) : data?.records && data.records.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(input) => {
                          if (input) input.indeterminate = isIndeterminate;
                        }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      标题
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      描述
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      难度
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      标签
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      创建时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      浏览/收藏
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.records.map((question) => {
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
                    const status =
                      question.status !== undefined
                        ? statusMap[question.status] || {
                            label: "未知",
                            className: "bg-gray-100 text-gray-600",
                          }
                        : {
                            label: "草稿",
                            className: "bg-gray-100 text-gray-600",
                          };

                    return (
                      <tr key={question.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(question.id!)}
                            onChange={(e) =>
                              handleSelectOne(question.id!, e.target.checked)
                            }
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {question.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {question.title}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                          {question.description || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${difficulty.className}`}
                          >
                            {difficulty.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {question.tagList && question.tagList.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {question.tagList.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                              {question.tagList.length > 3 && (
                                <span className="px-2 py-1 text-gray-500 text-xs">
                                  +{question.tagList.length - 3}
                                </span>
                              )}
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {question.createdAt
                            ? new Date(question.createdAt).toLocaleString("zh-CN")
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {`${question.viewCount ?? 0} / ${question.favoriteCount ?? 0}`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {data.total > pageSize && totalPages > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  共 {data.total} 条记录，第 {currentPage} / {totalPages} 页
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    上一页
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage >= totalPages}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-500">暂无题目数据</p>
          </div>
        )}
      </div>

      {/* 绑定到题库对话框 */}
      <Dialog open={bindDialogOpen} onOpenChange={setBindDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>绑定题目到题库</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                题库ID
              </label>
              <Input
                type="number"
                value={bankId}
                onChange={(e) => setBankId(e.target.value)}
                placeholder="请输入题库ID"
                className="w-full"
              />
            </div>
            <div className="text-sm text-gray-600">
              已选择 <span className="font-semibold">{selectedIds.size}</span> 个题目
            </div>
            {bindError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{bindError}</p>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setBindDialogOpen(false);
                  setBankId("");
                  setBindError(null);
                }}
                disabled={bindMutation.isPending}
              >
                取消
              </Button>
              <Button
                onClick={handleBind}
                disabled={bindMutation.isPending || !bankId.trim()}
              >
                {bindMutation.isPending ? "绑定中..." : "确认绑定"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


