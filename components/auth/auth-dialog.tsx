"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useLogin, useRegister } from "@/hooks/use-auth";
import type { LoginRequest, RegisterRequest } from "@/lib/api/auth";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const { toast } = useToast();

  // 分别为登录和注册创建独立的表单状态
  const loginForm = useForm<Pick<LoginRequest, "username" | "password">>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterRequest>({
    defaultValues: {
      username: "",
      password: "",
      email: "",
    },
  });

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  // 当切换模式时，重置当前表单的验证状态
  const handleModeChange = (newMode: "login" | "register") => {
    setMode(newMode);

    // 清除之前模式的验证错误
    if (newMode === "login") {
      loginForm.clearErrors();
    } else {
      registerForm.clearErrors();
    }
  };

  const handleLogin = async (
    data: Pick<LoginRequest, "username" | "password">
  ) => {
    try {
      await loginMutation.mutateAsync(data);
      toast({
        title: "登录成功",
        description: "欢迎回来！",
      });
      onOpenChange(false);
      loginForm.reset();
    } catch (error) {
      toast({
        title: "登录失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      });
    }
  };

  const handleRegister = async (data: RegisterRequest) => {
    try {
      await registerMutation.mutateAsync(data);
      // 注册成功后自动登录
      await loginMutation.mutateAsync({
        username: data.username,
        password: data.password,
      });
      toast({
        title: "注册成功",
        description: "欢迎加入面试猿！",
      });
      onOpenChange(false);
      registerForm.reset();
    } catch (error) {
      toast({
        title: "注册失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      });
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[500px] max-w-4xl overflow-hidden rounded-lg p-0">
        <div className="grid h-full grid-cols-10">
          {/* 左侧：Logo 和介绍 (3/10) */}
          <div className="col-span-3 flex h-full flex-col items-center justify-center bg-gradient-to-br from-primary to-gray-800 p-8 text-white">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 text-3xl font-extrabold">
                猿
              </div>
              <h2 className="text-2xl font-bold">面试猿刷题</h2>
              <p className="mt-4 text-center text-sm text-white/80">
                理论精通 • 概念理解 • 面试必备
              </p>
              <p className="mt-2 text-center text-xs text-white/60">
                专业的面试题库平台，助你轻松应对技术面试
              </p>
            </div>
          </div>

          {/* 右侧：登录/注册表单 (7/10) */}
          <div className="col-span-7 flex h-full flex-col p-8">
            <div className="mx-auto flex h-full w-full max-w-md flex-col">
              <Tabs
                value={mode}
                onValueChange={handleModeChange}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">登录</TabsTrigger>
                  <TabsTrigger value="register">注册</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="mt-6">
                  <Form {...loginForm}>
                    <form
                      onSubmit={loginForm.handleSubmit(handleLogin)}
                      className="space-y-4"
                    >
                      <FormField
                        control={loginForm.control}
                        name="username"
                        rules={{
                          required: "用户名不能为空",
                          minLength: {
                            value: 3,
                            message: "用户名至少需要3个字符",
                          },
                        }}
                        render={({ field }) => (
                          <FormItem className="flex flex-col space-y-2">
                            <div className="flex flex-row items-center space-x-4">
                              <FormLabel className="w-16 flex-shrink-0 text-right text-sm font-medium sm:w-20">
                                用户名
                              </FormLabel>
                              <FormControl className="flex-1">
                                <Input
                                  placeholder="请输入用户名"
                                  {...field}
                                  disabled={isLoading}
                                />
                              </FormControl>
                            </div>
                            <FormMessage className="ml-20 text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={loginForm.control}
                        name="password"
                        rules={{
                          required: "密码不能为空",
                          minLength: {
                            value: 6,
                            message: "密码至少需要6个字符",
                          },
                        }}
                        render={({ field }) => (
                          <FormItem className="flex flex-col space-y-2">
                            <div className="flex flex-row items-center space-x-4">
                              <FormLabel className="w-16 flex-shrink-0 text-right text-sm font-medium sm:w-20">
                                密码
                              </FormLabel>
                              <FormControl className="flex-1">
                                <Input
                                  type="password"
                                  placeholder="请输入密码"
                                  {...field}
                                  disabled={isLoading}
                                />
                              </FormControl>
                            </div>
                            <FormMessage className="ml-20 text-xs" />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? "登录中..." : "登录"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="register" className="mt-6">
                  <Form {...registerForm}>
                    <form
                      onSubmit={registerForm.handleSubmit(handleRegister)}
                      className="space-y-4"
                    >
                      <FormField
                        control={registerForm.control}
                        name="username"
                        rules={{
                          required: "用户名不能为空",
                          minLength: {
                            value: 3,
                            message: "用户名至少需要3个字符",
                          },
                        }}
                        render={({ field }) => (
                          <FormItem className="flex flex-col space-y-2">
                            <div className="flex flex-row items-center space-x-4">
                              <FormLabel className="w-16 flex-shrink-0 text-right text-sm font-medium sm:w-20">
                                用户名
                              </FormLabel>
                              <FormControl className="flex-1">
                                <Input
                                  placeholder="请输入用户名"
                                  {...field}
                                  disabled={isLoading}
                                />
                              </FormControl>
                            </div>
                            <FormMessage className="ml-20 text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="email"
                        rules={{
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "请输入有效的邮箱地址",
                          },
                        }}
                        render={({ field }) => (
                          <FormItem className="flex flex-col space-y-2">
                            <div className="flex flex-row items-center space-x-4">
                              <FormLabel className="w-16 flex-shrink-0 text-right text-sm font-medium sm:w-20">
                                邮箱
                              </FormLabel>
                              <FormControl className="flex-1">
                                <Input
                                  type="email"
                                  placeholder="请输入邮箱"
                                  {...field}
                                  disabled={isLoading}
                                />
                              </FormControl>
                            </div>
                            <FormMessage className="ml-20 text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="password"
                        rules={{
                          required: "密码不能为空",
                          minLength: {
                            value: 6,
                            message: "密码至少需要6个字符",
                          },
                        }}
                        render={({ field }) => (
                          <FormItem className="flex flex-col space-y-2">
                            <div className="flex flex-row items-center space-x-4">
                              <FormLabel className="w-16 flex-shrink-0 text-right text-sm font-medium sm:w-20">
                                密码
                              </FormLabel>
                              <FormControl className="flex-1">
                                <Input
                                  type="password"
                                  placeholder="请输入密码"
                                  {...field}
                                  disabled={isLoading}
                                />
                              </FormControl>
                            </div>
                            <FormMessage className="ml-20 text-xs" />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? "注册中..." : "注册"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
