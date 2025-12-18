"use client";

import { useCallback, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  updateUserJobProfile,
  type UpdateUserJobProfileRequest,
} from "@/lib/api/user";
import type { UserProfile } from "@/types";

interface EditJobProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile?: UserProfile | null;
}

// 目标等级选项: 0=小厂, 1=中厂, 2=大厂
const TARGET_LEVEL_OPTIONS = [
  { value: "0", label: "🏠 小厂" },
  { value: "1", label: "🏢 中厂" },
  { value: "2", label: "🏛️ 大厂" },
];

// 求职类型选项: 0=日常实习, 1=转正实习, 2=校招, 3=社招
const TARGET_TYPE_OPTIONS = [
  { value: "0", label: "📅 日常实习" },
  { value: "1", label: "📋 转正实习" },
  { value: "2", label: "🎓 校招" },
  { value: "3", label: "💼 社招" },
];

export function EditJobProfileDialog({
  open,
  onOpenChange,
  profile,
}: EditJobProfileDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 表单状态
  const [target, setTarget] = useState("");
  const [targetLevel, setTargetLevel] = useState<string>("");
  const [targetType, setTargetType] = useState<string>("");
  const [mainLanguage, setMainLanguage] = useState("");
  const [skillTags, setSkillTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // 初始化表单数据
  useEffect(() => {
    if (open && profile) {
      setTarget(profile.target || "");
      setTargetLevel(
        profile.targetLevel !== undefined ? String(profile.targetLevel) : ""
      );
      setTargetType(
        profile.targetType !== undefined ? String(profile.targetType) : ""
      );
      setMainLanguage(profile.mainLanguage || "");

      // 解析技能标签
      if (profile.skillTags) {
        try {
          const parsed = JSON.parse(profile.skillTags);
          setSkillTags(Array.isArray(parsed) ? parsed : []);
        } catch {
          setSkillTags([]);
        }
      } else {
        setSkillTags([]);
      }
      setTagInput("");
    }
  }, [open, profile]);

  // 添加标签
  const handleAddTag = useCallback(() => {
    const trimmed = tagInput.trim();
    if (trimmed && !skillTags.includes(trimmed)) {
      setSkillTags((prev) => [...prev, trimmed]);
      setTagInput("");
    }
  }, [tagInput, skillTags]);

  // 按回车添加标签
  const handleTagInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddTag();
      }
    },
    [handleAddTag]
  );

  // 删除标签
  const handleRemoveTag = useCallback((tag: string) => {
    setSkillTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  // 提交更新
  const mutation = useMutation({
    mutationFn: (data: UpdateUserJobProfileRequest) =>
      updateUserJobProfile(data),
    onSuccess: async () => {
      toast({
        title: "更新成功",
        description: "求职档案已更新。",
      });
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "更新失败",
        description:
          error?.response?.data?.message || error?.message || "请稍后再试",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const payload: UpdateUserJobProfileRequest = {
        target: target || undefined,
        targetLevel: targetLevel ? Number(targetLevel) : undefined,
        targetType: targetType ? Number(targetType) : undefined,
        mainLanguage: mainLanguage || undefined,
        skillTags: skillTags.length > 0 ? JSON.stringify(skillTags) : undefined,
      };

      mutation.mutate(payload);
    },
    [target, targetLevel, targetType, mainLanguage, skillTags, mutation]
  );

  const isSubmitting = mutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>编辑求职档案</DialogTitle>
          <DialogDescription>
            更新您的求职意向，获得更精准的面试推荐
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 目标岗位 */}
          <div className="space-y-2">
            <Label htmlFor="target">目标岗位</Label>
            <Input
              id="target"
              placeholder="如：Java后端工程师"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>

          {/* 目标公司等级 & 求职类型 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>目标公司等级</Label>
              <Select value={targetLevel} onValueChange={setTargetLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_LEVEL_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>求职类型</Label>
              <Select value={targetType} onValueChange={setTargetType}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 主要语言 */}
          <div className="space-y-2">
            <Label htmlFor="mainLanguage">主要语言</Label>
            <Input
              id="mainLanguage"
              placeholder="如：Java、Python、Go"
              value={mainLanguage}
              onChange={(e) => setMainLanguage(e.target.value)}
            />
          </div>

          {/* 技能标签 */}
          <div className="space-y-2">
            <Label>技能标签</Label>
            {skillTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {skillTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-primary/70 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="输入标签后回车添加"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
              >
                添加
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                "保存"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}





