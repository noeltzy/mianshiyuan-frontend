"use client";

import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUserStore, getUserDisplayName, getUserAvatarLetter } from "@/store/user-store";
import { AuthGuard } from "@/components/auth/auth-guard";
import { MyQuestionsList } from "@/components/profile/my-questions-list";
import { MyAnswersList } from "@/components/profile/my-answers-list";

type TabType = "create" | "favorite" | "answers";

export function ProfilePage() {
  const { user } = useUserStore();
  const [activeTab, setActiveTab] = useState<TabType>("create");

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
    { key: "favorite" as TabType, label: "题目收藏" },
    { key: "answers" as TabType, label: "我的回答" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "create":
        return <MyQuestionsList />;
      case "favorite":
        return (
          <div className="px-6 py-4 text-center text-gray-500">
            <p>暂无收藏的题目</p>
            <p className="text-sm mt-2">浏览题库并收藏您感兴趣的题目吧！</p>
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
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                {/* 用户头像 */}
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.avatarUrl} alt={getUserDisplayName(user)} />
                  <AvatarFallback className="bg-gray-200 text-gray-600 text-lg font-bold border border-gray-300">
                    {getUserAvatarLetter(user)}
                  </AvatarFallback>
                </Avatar>

                {/* 用户基本信息 */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-gray-900 truncate">
                    {getUserDisplayName(user)}
                  </h2>
                  <div className="space-y-1 text-sm text-gray-600 mt-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">邮箱：</span>
                      <span className="truncate">{user.email || "未设置"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">角色：</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'ADMIN' ? '管理员' : '普通用户'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">注册时间：</span>
                      <span>{user.createTime ? new Date(user.createTime).toLocaleDateString('zh-CN') : "未知"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 学习统计 */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">学习统计</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">已答题库</span>
                  <span className="font-medium text-gray-900">0 个</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">完成题目</span>
                  <span className="font-medium text-gray-900">0 道</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">学习时长</span>
                  <span className="font-medium text-gray-900">0 小时</span>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧 Tab 区域（6份） */}
          <div className="col-span-6">
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
              {/* Tab 导航 */}
              <div className="border-b border-gray-200">
                <nav className="flex">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.key
                          ? "border-primary text-primary bg-blue-50"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab 内容 */}
              <div>
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
