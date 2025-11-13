"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-auth";
import { useUserStore } from "@/store/user-store";
import { getToken } from "@/lib/utils/token";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { user } = useUserStore();
  const [isMounted, setIsMounted] = useState(false);
  const [token, setTokenState] = useState<string | null>(null);
  const { data: currentUser, isLoading } = useCurrentUser();

  useEffect(() => {
    setTokenState(getToken());
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    if (!token && !isLoading) {
      router.replace("/");
      return;
    }

    // 如果有用户信息，检查权限
    if (currentUser || user) {
      const userRole = currentUser?.role || user?.role;
      if (userRole !== "ADMIN") {
        router.replace("/");
        return;
      }
    }
  }, [isMounted, token, currentUser, user, isLoading, router]);

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

  // 加载中或未授权时显示加载状态
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

  // 检查权限
  const userRole = currentUser?.role || user?.role;
  if (!token || userRole !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div>
            <p className="text-lg font-semibold text-gray-900">访问被拒绝</p>
            <p className="mt-2 text-gray-600">您没有权限访问此页面</p>
          </div>
          <button
            onClick={() => router.replace("/")}
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            返回主页
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

