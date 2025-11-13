"use client";

import { BookOpen, Users, FileText, TrendingUp } from "lucide-react";

export function AdminDashboard() {
  const stats = [
    {
      title: "题库总数",
      value: "0",
      icon: BookOpen,
      color: "bg-blue-500",
    },
    {
      title: "用户总数",
      value: "0",
      icon: Users,
      color: "bg-green-500",
    },
    {
      title: "题目总数",
      value: "0",
      icon: FileText,
      color: "bg-purple-500",
    },
    {
      title: "今日访问",
      value: "0",
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">仪表盘</h1>
        <p className="mt-2 text-gray-600">欢迎来到管理后台</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`${stat.color} p-3 rounded-lg text-white`}
                >
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 快速操作 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">快速操作</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <a
            href="/admin/banks"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="font-medium text-gray-900">管理题库</span>
          </a>
          <a
            href="/admin/questions"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="h-5 w-5 text-primary" />
            <span className="font-medium text-gray-900">管理题目</span>
          </a>
        </div>
      </div>
    </div>
  );
}

