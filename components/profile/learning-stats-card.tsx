"use client";

import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { getUserAnswerStats } from "@/lib/api/user";
import type { UserAnswerStatsVO, DifficultyStatsVO } from "@/types";
import { Button } from "@/components/ui/button";

export function LearningStatsCard() {
  const [stats, setStats] = useState<UserAnswerStatsVO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getUserAnswerStats();
        setStats(data);
      } catch (error) {
        console.error("获取学习统计失败:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // 格式化分数为整数
  const formatScore = (score?: number): string => {
    if (score === undefined || score === null) return "-";
    return Math.round(score).toString();
  };

  // 格式化题目数
  const formatCount = (count?: number): string => {
    if (count === undefined || count === null) return "0";
    return count.toString();
  };

  // 渲染难度统计项
  const renderDifficultyItem = (
    label: string,
    difficultyStats?: DifficultyStatsVO | null
  ) => {
    const hasData = difficultyStats && difficultyStats.questionCount > 0;
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-gray-300" />
          <span className="text-gray-600">{label}</span>
        </div>
        <span className="font-medium text-gray-900">
          {hasData ? formatScore(difficultyStats.averageScore) : "-"} 分 /{" "}
          {formatCount(difficultyStats?.questionCount)} 题
        </span>
      </div>
    );
  };

  // 加载状态
  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">学习统计</h3>
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
        </div>
      </div>
    );
  }

  // 无数据状态（totalQuestionCount === 0 或 stats 为空）
  const hasNoData = !stats || stats.totalQuestionCount === 0;

  if (hasNoData) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">学习统计</h3>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <BookOpen className="mb-3 h-12 w-12 text-gray-300" />
          <p className="mb-1 text-gray-600">还没有答题记录哦~</p>
          <p className="mb-4 text-sm text-gray-400">
            去题库开始你的学习之旅吧！
          </p>
          <Link href="/">
            <Button size="sm" variant="default">
              开始答题
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 有数据状态
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">学习统计</h3>
      <div className="space-y-3">
        {/* 总均分 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="font-medium text-gray-900">总均分</span>
          </div>
          <span className="font-semibold text-primary">
            {formatScore(stats.overallAverageScore)} 分 /{" "}
            {formatCount(stats.totalQuestionCount)} 题
          </span>
        </div>

        {/* 分隔线 */}
        <div className="border-t border-gray-100" />

        {/* 各难度统计 */}
        {renderDifficultyItem("简单", stats.easyStats)}
        {renderDifficultyItem("中等", stats.mediumStats)}
        {renderDifficultyItem("困难", stats.hardStats)}
      </div>
    </div>
  );
}



