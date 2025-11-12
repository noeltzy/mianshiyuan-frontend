"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  Menu,
  X,
  LogOut,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const adminNavItems = [
  {
    href: "/admin",
    label: "仪表盘",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/banks",
    label: "题库管理",
    icon: BookOpen,
  },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { mutate: logout } = useLogout();
  const router = useRouter();

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        router.push("/");
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 移动端顶部栏 */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="/admin" className="flex items-center gap-2 font-bold">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-sm text-white">
              管
            </span>
            <span>管理后台</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            {sidebarOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* 侧边栏 */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <Link href="/admin" className="flex items-center gap-2 font-bold">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-sm text-white">
                管
              </span>
              <span>管理后台</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* 底部操作 */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Home className="h-5 w-5" />
              <span className="font-medium">返回前台</span>
            </Link>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-3 text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">退出登录</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* 遮罩层（移动端） */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 主内容区 */}
      <div className="lg:pl-64 pt-16 lg:pt-0">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

