"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin, useRegister } from "@/hooks/use-auth";
import type { LoginRequest, RegisterRequest } from "@/lib/api/auth";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [formData, setFormData] = useState<LoginRequest & RegisterRequest>({
    username: "",
    password: "",
    email: "",
  });

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === "login") {
        await loginMutation.mutateAsync({
          username: formData.username,
          password: formData.password,
        });
        onOpenChange(false);
        setFormData({ username: "", password: "", email: "" });
      } else {
        await registerMutation.mutateAsync({
          username: formData.username,
          password: formData.password,
          email: formData.email || undefined,
        });
        // 注册成功后自动登录
        await loginMutation.mutateAsync({
          username: formData.username,
          password: formData.password,
        });
        onOpenChange(false);
        setFormData({ username: "", password: "", email: "" });
      }
    } catch (error) {
      // 错误处理由 mutation 处理
      console.error(error);
    }
  };

  const isLoading =
    loginMutation.isPending ||
    registerMutation.isPending ||
    (mode === "register" && registerMutation.isSuccess && loginMutation.isPending);
  const error = loginMutation.error || registerMutation.error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 h-[500px] overflow-hidden rounded-lg">
        <div className="grid grid-cols-10 h-full">
          {/* 左侧：Logo 和介绍 (3/10) */}
          <div className="col-span-3 bg-gradient-to-br from-primary to-gray-800 p-8 flex flex-col justify-center items-center text-white h-full">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 text-3xl font-extrabold">
                猿
              </div>
              <h2 className="text-2xl font-bold">面试猿刷题</h2>
              <p className="text-sm text-white/80 text-center mt-4">
                理论精通 • 概念理解 • 面试必备
              </p>
              <p className="text-xs text-white/60 text-center mt-2">
                专业的面试题库平台，助你轻松应对技术面试
              </p>
            </div>
          </div>

          {/* 右侧：登录/注册表单 (7/10) */}
          <div className="col-span-7 p-8 h-full flex flex-col">
            <div className="max-w-md mx-auto w-full flex flex-col h-full">
              {/* 切换标签 */}
              <div className="flex gap-4 mb-8">
                <button
                  onClick={() => setMode("login")}
                  className={`flex-1 py-2 text-center font-semibold transition-colors ${
                    mode === "login"
                      ? "text-primary border-b-2 border-primary"
                      : "text-gray-400"
                  }`}
                >
                  登录
                </button>
                <button
                  onClick={() => setMode("register")}
                  className={`flex-1 py-2 text-center font-semibold transition-colors ${
                    mode === "register"
                      ? "text-primary border-b-2 border-primary"
                      : "text-gray-400"
                  }`}
                >
                  注册
                </button>
              </div>

              {/* 表单 */}
              <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
                <div className="space-y-4 flex-1">
                  <div>
                    <Input
                      type="text"
                      placeholder="用户名"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {/* 注册模式才显示邮箱字段 */}
                  {mode === "register" && (
                    <div>
                      <Input
                        type="email"
                        placeholder="邮箱（可选）"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        disabled={isLoading}
                      />
                    </div>
                  )}

                  <div>
                    <Input
                      type="password"
                      placeholder="密码"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {error && (
                    <div className="text-sm text-red-500 min-h-[20px]">
                      {error instanceof Error
                        ? error.message
                        : "操作失败，请重试"}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full mt-auto"
                  disabled={isLoading}
                >
                  {isLoading
                    ? "处理中..."
                    : mode === "login"
                      ? "登录"
                      : "注册"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

