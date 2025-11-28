"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserStore, getUserDisplayName, getUserAvatarLetter } from "@/store/user-store";
import { useLogout } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";

export function UserMenu() {
  const { user } = useUserStore();
  const logoutMutation = useLogout();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    
    // 检测当前路径，如果在个人中心页面则跳转到主页
    if (pathname === "/profile") {
      router.push("/");
    } else {
      // 其他页面刷新路由
      router.refresh();
    }
  };

  const handleProfile = () => {
    router.push("/profile");
  };

const handleAdminDashboard = () => {
  router.push("/admin");
  };

  const handleAddQuestion = () => {
    router.push("/questions/add");
  };

  if (!user) {
    return null;
  }

  const isAdmin = user.role === "ADMIN";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <Avatar className="h-7 w-7">
            <AvatarImage 
              src={user.avatarUrl || "/images/default-avatar.png"} 
              alt={getUserDisplayName(user)} 
            />
          </Avatar>
          <span className="font-semibold text-gray-700 whitespace-nowrap">
            {getUserDisplayName(user)}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-36">
        <DropdownMenuItem onClick={handleProfile}>个人中心</DropdownMenuItem>
        <DropdownMenuItem onClick={handleAddQuestion}>
          添加题目
        </DropdownMenuItem>
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleAdminDashboard}>
              管理后台
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

