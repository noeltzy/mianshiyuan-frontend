"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2 } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { uploadImageToOss } from "@/lib/oss/upload-image";
import { getImageUploadCredentials } from "@/lib/api/file";
import { updateUserProfile, type UpdateUserRequest } from "@/lib/api/user";
import {
  useUserStore,
  getUserDisplayName,
  getUserAvatarLetter,
} from "@/store/user-store";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB

const profileSchema = z.object({
  avatarUrl: z.string().url("请上传有效的头像地址").min(1, "请上传头像"),
  nickname: z.string().min(1, "请输入昵称"),
  email: z.string().email("邮箱格式不正确").or(z.literal("")),
  phone: z
    .string()
    .regex(/^1[3-9]\d{9}$/, "手机号格式不正确")
    .or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileDialog({
  open,
  onOpenChange,
}: EditProfileDialogProps) {
  const { user } = useUserStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      avatarUrl: user?.avatarUrl || "",
      nickname: user?.nickname || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  useEffect(() => {
    if (user && open) {
      form.reset({
        avatarUrl: user.avatarUrl || "",
        nickname: user.nickname || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user, open, form]);

  const avatarPreview = form.watch("avatarUrl");

  const mutation = useMutation({
    mutationFn: (payload: UpdateUserRequest) => updateUserProfile(payload),
    onSuccess: async () => {
      toast({
        title: "更新成功",
        description: "个人信息已同步。",
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

  const handleUploadAvatar = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      if (file.size > MAX_AVATAR_SIZE) {
        toast({
          title: "上传失败",
          description: "头像大小需小于 2MB。",
          variant: "destructive",
        });
        event.target.value = "";
        return;
      }

      setIsUploading(true);
      try {
        const credentials = await getImageUploadCredentials();
        const url = await uploadImageToOss(file, credentials);
        form.setValue("avatarUrl", url, {
          shouldDirty: true,
          shouldValidate: true,
        });
        toast({
          title: "上传成功",
          description: "头像已更新，记得保存表单同步信息。",
        });
      } catch (error: any) {
        toast({
          title: "上传失败",
          description: error?.message || "上传出现异常，请稍后重试。",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
        event.target.value = "";
      }
    },
    [form, toast]
  );

  const onSubmit = useCallback(
    (values: ProfileFormValues) => {
      const payload: UpdateUserRequest = {
        avatarUrl: values.avatarUrl,
        nickname: values.nickname,
        email: values.email || undefined,
        phone: values.phone || undefined,
      };
      mutation.mutate(payload);
    },
    [mutation]
  );

  const isSubmitting = mutation.isPending || isUploading;
  const displayName = useMemo(() => getUserDisplayName(user), [user]);
  const avatarLetter = useMemo(() => getUserAvatarLetter(user), [user]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>编辑个人信息</DialogTitle>
          <DialogDescription>
            更新头像、昵称及联系方式，保持账户信息最新。
          </DialogDescription>
        </DialogHeader>

        {!user ? (
          <div className="py-10 text-center text-sm text-gray-500">
            暂无用户信息，稍后再试。
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatarPreview || "/images/default-avatar.png"} alt={displayName} />
                </Avatar>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">
                    {displayName}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleUploadAvatar}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          上传中...
                        </>
                      ) : (
                        <>
                          <ImagePlus className="mr-2 h-4 w-4" />
                          上传头像
                        </>
                      )}
                    </Button>
                    {avatarPreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          form.setValue("avatarUrl", "", {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                      >
                        清空
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    支持 JPG/PNG，大小不超过 2MB。
                  </p>
                </div>
              </div>

              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="nickname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>昵称</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入昵称" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>邮箱</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="example@email.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>手机号</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="11位手机号码"
                          maxLength={11}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="avatarUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>头像地址</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="上传后自动回填，也可手动粘贴"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
