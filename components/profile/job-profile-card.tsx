"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Building2,
  Code2,
  Pencil,
  Target,
  User2,
} from "lucide-react";
import type { UserProfile } from "@/types";

interface JobProfileCardProps {
  profile?: UserProfile | null;
  extMap?: Record<string, string>; // 用于判断是否上传了简历
  onEdit?: () => void; // 编辑回调
}

// 目标等级映射: 0=小厂, 1=中厂, 2=大厂
const TARGET_LEVEL_MAP: Record<number, { label: string; icon: string }> = {
  0: { label: "小厂", icon: "🏠" },
  1: { label: "中厂", icon: "🏢" },
  2: { label: "大厂", icon: "🏛️" },
};

// 求职类型映射: 0=日常实习, 1=转正实习, 2=校招, 3=社招
const TARGET_TYPE_MAP: Record<number, { label: string; icon: string }> = {
  0: { label: "日常实习", icon: "📅" },
  1: { label: "转正实习", icon: "📋" },
  2: { label: "校招", icon: "🎓" },
  3: { label: "社招", icon: "💼" },
};

// 根据分数获取进度条颜色
function getLevelColor(level: number): string {
  if (level < 40) return "bg-red-500";
  if (level < 70) return "bg-yellow-500";
  return "bg-green-500";
}

// 根据分数获取进度条背景色
function getLevelBgColor(level: number): string {
  if (level < 40) return "bg-red-100";
  if (level < 70) return "bg-yellow-100";
  return "bg-green-100";
}

export function JobProfileCard({
  profile,
  extMap,
  onEdit,
}: JobProfileCardProps) {
  // 检查是否有任何有效数据（通过 extMap.resume === "true" 判断）
  const hasData = extMap?.resume === "true";

  // 解析技能标签（JSON 格式的字符串数组）
  const skillTagList: string[] = (() => {
    if (!profile?.skillTags) return [];
    try {
      const parsed = JSON.parse(profile.skillTags);
      return Array.isArray(parsed) ? parsed.filter((tag) => tag) : [];
    } catch {
      // 兼容逗号分隔的旧格式
      return profile.skillTags.split(",").filter((tag) => tag.trim());
    }
  })();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Briefcase className="h-5 w-5 text-primary" />
            求职档案
          </CardTitle>
          {hasData && onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-primary"
              onClick={onEdit}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasData ? (
          // 空状态
          <div className="py-4 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <User2 className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">完善求职档案</p>
            <p className="mt-1 text-xs text-gray-400">获得更精准的面试推荐</p>
          </div>
        ) : (
          <>
            {/* 当前水平 */}
            {profile?.level !== undefined && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">当前水平</span>
                  <span className="font-semibold text-gray-900">
                    {profile.level}分
                  </span>
                </div>
                <div
                  className={`h-2 w-full overflow-hidden rounded-full ${getLevelBgColor(profile.level)}`}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getLevelColor(profile.level)}`}
                    style={{ width: `${Math.min(profile.level, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* 信息列表 */}
            <div className="space-y-3">
              {/* 目标公司 */}
              {profile?.target && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-600">
                    <Target className="h-4 w-4" />
                    目标岗位
                  </span>
                  <span className="font-medium text-gray-900">
                    {profile.target}
                  </span>
                </div>
              )}

              {/* 目标等级 */}
              {profile?.targetLevel !== undefined &&
                TARGET_LEVEL_MAP[profile.targetLevel] && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-600">
                      <Building2 className="h-4 w-4" />
                      目标公司
                    </span>
                    <span className="font-medium text-gray-900">
                      {TARGET_LEVEL_MAP[profile.targetLevel].icon}{" "}
                      {TARGET_LEVEL_MAP[profile.targetLevel].label}
                    </span>
                  </div>
                )}

              {/* 求职类型 */}
              {profile?.targetType !== undefined &&
                TARGET_TYPE_MAP[profile.targetType] && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-600">
                      <Briefcase className="h-4 w-4" />
                      求职类型
                    </span>
                    <span className="font-medium text-gray-900">
                      {TARGET_TYPE_MAP[profile.targetType].icon}{" "}
                      {TARGET_TYPE_MAP[profile.targetType].label}
                    </span>
                  </div>
                )}

              {/* 主要语言 */}
              {profile?.mainLanguage && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-600">
                    <Code2 className="h-4 w-4" />
                    主要语言
                  </span>
                  <span className="font-medium text-gray-900">
                    {profile.mainLanguage}
                  </span>
                </div>
              )}
            </div>

            {/* 技能标签 */}
            {skillTagList.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm text-gray-600">技能标签</span>
                <div className="flex flex-wrap gap-1.5">
                  {skillTagList.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
