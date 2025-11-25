"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { getUserSettings, updateUserSettings } from "@/lib/api/user-settings";
import { useUserStore } from "@/store/user-store";

const SETTINGS_KEYS = {
  strictness: "aiReplayStrictness",
  showAnswer: "showAnswer",
} as const;

const strictnessOptions = [
  { value: "1", label: "1 - 宽松" },
  { value: "2", label: "2 - 适中" },
  { value: "3", label: "3 - 严格" },
];

const settingsSchema = z.object({
  aiReplayStrictness: z.enum(["1", "2", "3"]),
  showAnswer: z.boolean(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const defaultSettings: SettingsFormValues = {
  aiReplayStrictness: "2",
  showAnswer: true,
};

const deriveFormValues = (map: Record<string, string>): SettingsFormValues => {
  // 处理空值或无效值
  if (!map || typeof map !== "object" || Object.keys(map).length === 0) {
    return defaultSettings;
  }

  const showAnswerValue = map[SETTINGS_KEYS.showAnswer];
  let showAnswer: boolean;

  if (
    showAnswerValue === undefined ||
    showAnswerValue === null ||
    showAnswerValue === ""
  ) {
    // 如果值为空、未定义或空字符串，使用默认值
    showAnswer = defaultSettings.showAnswer;
  } else {
    // 明确检查字符串值
    showAnswer = showAnswerValue === "true";
  }

  return {
    aiReplayStrictness:
      (map[
        SETTINGS_KEYS.strictness
      ] as SettingsFormValues["aiReplayStrictness"]) ??
      defaultSettings.aiReplayStrictness,
    showAnswer,
  };
};

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { settings: settingsMap, settingsLoaded } = useUserStore((state) => ({
    settings: state.settings,
    settingsLoaded: state.settingsLoaded,
  }));

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: defaultSettings,
  });

  // 对话框打开时强制重新获取设置数据
  const { isLoading, isFetching } = useQuery({
    queryKey: ["userSettings"],
    queryFn: getUserSettings,
    enabled: open, // 只要对话框打开就获取数据
    staleTime: 0, // 确保总是获取最新数据
    // 当对话框重新打开时，强制重新获取数据
    refetchOnMount: "always",
  });

  // 监听全局设置变化，更新表单值
  useEffect(() => {
    if (!open) return;
    if (!settingsLoaded) return; // 等待设置加载完成

    const formValues = deriveFormValues(settingsMap);
    form.reset(formValues);
  }, [settingsMap, open, form, settingsLoaded]);

  const mutation = useMutation({
    mutationFn: (values: SettingsFormValues) =>
      updateUserSettings([
        {
          settingKey: SETTINGS_KEYS.strictness,
          settingValue: values.aiReplayStrictness,
        },
        {
          settingKey: SETTINGS_KEYS.showAnswer,
          settingValue: String(values.showAnswer),
        },
      ]),
    onSuccess: async (_variables) => {
      toast({
        title: "保存成功",
        description: "设置已更新，将立即生效。",
      });
      // 让 useUserSettings hook 重新获取数据并更新状态
      await queryClient.invalidateQueries({ queryKey: ["userSettings"] });
      onOpenChange(false);
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "请稍后再试";
      toast({
        title: "保存失败",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = useCallback(
    (values: SettingsFormValues) => {
      mutation.mutate(values);
    },
    [mutation]
  );

  const isSaving = mutation.isPending;
  const isInitialLoading = !settingsLoaded && (isLoading || isFetching);

  const strictnessValue = form.watch("aiReplayStrictness");
  const currentStrictnessLabel = useMemo(
    () =>
      strictnessOptions.find((option) => option.value === strictnessValue)
        ?.label,
    [strictnessValue]
  );

  // 只有在设置数据加载完成后才重置表单
  useEffect(() => {
    if (!open) return;
    if (!settingsLoaded) return; // 等待设置加载完成
    form.reset(deriveFormValues(settingsMap));
  }, [settingsMap, settingsLoaded, open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>设置中心</DialogTitle>
          <DialogDescription>
            管理 AI 评分相关选项，定制更适合自己的答题体验。
          </DialogDescription>
        </DialogHeader>

        {isInitialLoading ? (
          <div className="flex items-center justify-center py-10 text-gray-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            正在加载设置...
          </div>
        ) : (
          <Form {...form}>
            <form
              className="space-y-6"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <FormField
                control={form.control}
                name="aiReplayStrictness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AI 评分严格度</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isSaving}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="请选择严格度" />
                        </SelectTrigger>
                        <SelectContent>
                          {strictnessOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      当前：{currentStrictnessLabel || "未设置"}
                      。数值越大评分越严格。
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="showAnswer"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2 rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <FormLabel>答题后直接显示标准答案</FormLabel>
                        <FormDescription>
                          开启后提交答案立即展示参考解答。
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSaving}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSaving}
                >
                  取消
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
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
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
