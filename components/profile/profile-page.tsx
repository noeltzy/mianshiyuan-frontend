"use client";

import { useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ChevronRight,
  Settings as SettingsIcon,
  UserRound,
} from "lucide-react";
import {
  useUserStore,
  getUserDisplayName,
  getUserAvatarLetter,
} from "@/store/user-store";
import { AuthGuard } from "@/components/auth/auth-guard";
import { MyQuestionsList } from "@/components/profile/my-questions-list";
import { MyBanksList } from "@/components/profile/my-banks-list";
import { MyAnswersList } from "@/components/profile/my-answers-list";
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog";
import { SettingsDialog } from "@/components/profile/settings-dialog";

type TabType = "create" | "banks" | "favorite" | "answers";

export function ProfilePage() {
  const { user } = useUserStore();
  const [activeTab, setActiveTab] = useState<TabType>("create");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  if (!user) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="text-center">
          <div className="text-gray-500">加载中...</div>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "create" as TabType, label: "题目创建" },
    { key: "banks" as TabType, label: "我的题库" },
    { key: "favorite" as TabType, label: "题目收藏" },
    { key: "answers" as TabType, label: "我的回答" },
  ];

  const quickLinks = [
    {
      label: "个人信息",
      icon: UserRound,
      onClick: () => setEditDialogOpen(true),
    },
    {
      label: "设置中心",
      icon: SettingsIcon,
      onClick: () => setSettingsDialogOpen(true),
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "create":
        return <MyQuestionsList />;
      case "banks":
        return <MyBanksList />;
      case "favorite":
        return (
          <div className="px-6 py-4 text-center text-gray-500">
            <p>暂无收藏的题目</p>
            <p className="mt-2 text-sm">浏览题库并收藏您感兴趣的题目吧！</p>
          </div>
        );
      case "answers":
        return <MyAnswersList />;
      default:
        return null;
    }
  };

  return (
    <AuthGuard>
      <div className="space-y-6">
        {/* 主要内容区域 */}
        <div className="grid grid-cols-10 gap-6">
          {/* 左侧用户信息和学习统计（4份） */}
          <div className="col-span-4 space-y-6">
            {/* 用户信息卡片 */}
            <Card>
              <CardContent className="p-0">
                <div className="flex items-center gap-4 p-6">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={user.avatarUrl || "/images/default-avatar.png"}
                      alt={getUserDisplayName(user)}
                    />
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold text-gray-900">
                      {getUserDisplayName(user)}
                    </p>
                    <p className="truncate text-sm text-gray-500">
                      {user.email || "未设置邮箱"}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex flex-col">
                  {quickLinks.map(({ label, icon: Icon, onClick }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={onClick}
                      disabled={!onClick}
                      className="flex w-full items-center gap-3 border-t border-gray-100 px-6 py-4 text-left transition-colors first:border-t first:border-transparent hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Icon className="h-5 w-5 text-gray-500" />
                      <span className="flex-1 text-sm font-medium text-gray-900">
                        {label}
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 学习统计 */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                学习统计
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">总均分</span>
                  <span className="font-medium text-gray-900">0 个</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">简单</span>
                  <span className="font-medium text-gray-900">0 分</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">中等</span>
                  <span className="font-medium text-gray-900">0 分</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">困难</span>
                  <span className="font-medium text-gray-900">0 分</span>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧 Tab 区域（6份） */}
          <div className="col-span-6">
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm flex flex-col" style={{ height: "fit-content" }}>
              {/* Tab 导航 */}
              <div className="border-b border-gray-200">
                <nav className="flex">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`border-b-2 px-6 py-3 text-sm font-medium transition-colors ${
                        activeTab === tab.key
                          ? "border-primary bg-blue-50 text-primary"
                          : "border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab 内容 */}
              <div className="flex-1">{renderTabContent()}</div>
            </div>
          </div>
        </div>
      </div>
      <EditProfileDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
      <SettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
      />
    </AuthGuard>
  );
}
