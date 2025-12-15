"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, MessageSquare, Trash2, X } from "lucide-react";
import type { ChatSession, InterviewScene } from "@/types/ai";
import { InterviewScenes } from "./interview-scenes";

interface AISidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  scenes: InterviewScene[];
  currentSceneId: string;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onSceneChange: (sceneId: string) => void;
  onUploadClick?: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function AISidebar({
  sessions,
  currentSessionId,
  scenes,
  currentSceneId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onSceneChange,
  onUploadClick,
  isOpen,
  onClose,
}: AISidebarProps) {
  return (
    <>
      {/* 移动端遮罩 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* 侧边栏 */}
      <aside
        className={cn(
          "fixed left-0 top-16 z-50 flex h-[calc(100vh-64px)] w-72 flex-col border-r border-gray-200 bg-white transition-transform duration-300 lg:static lg:z-0 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="font-semibold text-gray-800">AI 面试</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 新建对话按钮 */}
        <div className="p-3">
          <Button
            onClick={onNewChat}
            className="w-full gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-md"
          >
            <Plus className="h-4 w-4" />
            新建对话
          </Button>
        </div>

        {/* 场景选择 */}
        <div className="border-b border-gray-200 px-3 pb-4">
          <InterviewScenes
            scenes={scenes}
            currentSceneId={currentSceneId}
            onSceneChange={onSceneChange}
            onUploadClick={onUploadClick}
          />
        </div>

        {/* 历史对话列表 */}
        <div className="flex-1 overflow-y-auto p-3">
          <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            历史对话
          </h3>
          {sessions.length === 0 ? (
            <p className="px-3 text-sm text-gray-400">暂无对话记录</p>
          ) : (
            <div className="space-y-1">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    "group flex items-center gap-2 rounded-lg px-3 py-2 transition-colors cursor-pointer",
                    currentSessionId === session.id
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                  onClick={() => onSelectSession(session.id)}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-medium">
                      {session.title}
                    </div>
                    <div className="truncate text-xs text-gray-400">
                      {formatDate(session.updatedAt)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="hidden shrink-0 rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-600 group-hover:block"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) {
    return date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (diffDays === 1) {
    return "昨天";
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else {
    return date.toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
    });
  }
}

