"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-auth";
import { getToken } from "@/lib/utils/token";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [token, setTokenState] = useState<string | null>(null);
  const { isLoading } = useCurrentUser();

  useEffect(() => {
    // 仅在客户端执行
    setTokenState(getToken());
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) {
      return;
    }
    // 如果没有token，重定向到首页并打开登录弹窗
    if (!token && !isLoading) {
      router.replace("/?showLogin=true");
      return;
    }
  }, [token, isLoading, router, isMounted]);

  // 初次渲染时（服务端或尚未挂载）保持占位，避免水合不一致
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  // 加载中时显示加载状态
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  // 如果没有token，显示提示
  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">请先登录</p>
          <p className="mt-2 text-gray-600">您需要登录后才能访问此页面</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

