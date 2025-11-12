"use client";

import { useEffect } from "react";
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
  const token = typeof window !== "undefined" ? getToken() : null;
  const { data: currentUser, isLoading } = useCurrentUser();

  useEffect(() => {
    // 如果没有token，重定向到首页
    if (!token && !isLoading) {
      router.push("/");
      return;
    }

    // 如果有用户信息，检查权限
    if (currentUser || user) {
      const userRole = currentUser?.role || user?.role;
      if (userRole !== "ADMIN") {
        router.push("/");
        return;
      }
    }
  }, [token, currentUser, user, isLoading, router]);

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
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">访问被拒绝</p>
          <p className="mt-2 text-gray-600">您没有权限访问此页面</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

