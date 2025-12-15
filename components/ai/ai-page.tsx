"use client";

import { useState, useEffect, useCallback } from "react";
import { AISidebar } from "./ai-sidebar";
import { AIChat } from "./ai-chat";
import {
  interviewScenes,
  createNewSession,
  sendMessage,
  saveSessions,
  loadSessions,
  generateId,
} from "@/lib/api/ai";
import type { ChatSession, AIMessage } from "@/types/ai";

export function AIPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentSceneId, setCurrentSceneId] = useState("frontend");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 加载历史会话
  useEffect(() => {
    const savedSessions = loadSessions();
    if (savedSessions.length > 0) {
      setSessions(savedSessions);
      setCurrentSessionId(savedSessions[0].id);
      setCurrentSceneId(savedSessions[0].sceneId);
    }
  }, []);

  // 保存会话到本地存储
  useEffect(() => {
    if (sessions.length > 0) {
      saveSessions(sessions);
    }
  }, [sessions]);

  // 获取当前会话
  const currentSession = sessions.find((s) => s.id === currentSessionId);
  const currentScene = interviewScenes.find((s) => s.id === currentSceneId);

  // 创建新对话
  const handleNewChat = useCallback(() => {
    const newSession = createNewSession(currentSceneId);
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setSidebarOpen(false);
  }, [currentSceneId]);

  // 选择会话
  const handleSelectSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setCurrentSceneId(session.sceneId);
    }
    setSidebarOpen(false);
  }, [sessions]);

  // 删除会话
  const handleDeleteSession = useCallback((sessionId: string) => {
    setSessions((prev) => {
      const newSessions = prev.filter((s) => s.id !== sessionId);
      // 如果删除的是当前会话，切换到第一个会话
      if (sessionId === currentSessionId && newSessions.length > 0) {
        setCurrentSessionId(newSessions[0].id);
        setCurrentSceneId(newSessions[0].sceneId);
      } else if (newSessions.length === 0) {
        setCurrentSessionId(null);
      }
      return newSessions;
    });
  }, [currentSessionId]);

  // 切换场景
  const handleSceneChange = useCallback((sceneId: string) => {
    setCurrentSceneId(sceneId);
    // 如果当前有会话，更新会话的场景
    if (currentSessionId) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId ? { ...s, sceneId, updatedAt: Date.now() } : s
        )
      );
    }
  }, [currentSessionId]);

  // 上传文件点击（暂时只是UI）
  const handleUploadClick = useCallback(() => {
    // TODO: 实现文件上传功能
    console.log("上传简历按钮被点击");
  }, []);

  // 发送消息
  const handleSendMessage = useCallback(async (content: string) => {
    // 如果没有当前会话，先创建一个
    let sessionId = currentSessionId;
    if (!sessionId) {
      const newSession = createNewSession(currentSceneId);
      setSessions((prev) => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      sessionId = newSession.id;
    }

    // 创建用户消息
    const userMessage: AIMessage = {
      id: generateId(),
      role: "user",
      content,
      timestamp: Date.now(),
    };

    // 更新会话消息
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              messages: [...s.messages, userMessage],
              updatedAt: Date.now(),
            }
          : s
      )
    );

    // 开始加载
    setIsLoading(true);

    try {
      // 获取当前会话的消息数量（用于选择回复）
      const session = sessions.find((s) => s.id === sessionId);
      const messageIndex = session
        ? Math.floor(session.messages.filter((m) => m.role === "user").length)
        : 0;

      // 调用模拟API
      const response = await sendMessage(
        sessionId!,
        content,
        currentSceneId,
        messageIndex
      );

      // 创建AI回复消息
      const assistantMessage: AIMessage = {
        id: generateId(),
        role: "assistant",
        content: response.content,
        timestamp: response.timestamp,
      };

      // 更新会话消息
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                messages: [...s.messages, assistantMessage],
                updatedAt: Date.now(),
              }
            : s
        )
      );
    } catch (error) {
      console.error("发送消息失败:", error);
      // 可以在这里添加错误提示
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId, currentSceneId, sessions]);

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <AISidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        scenes={interviewScenes}
        currentSceneId={currentSceneId}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onSceneChange={handleSceneChange}
        onUploadClick={handleUploadClick}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <AIChat
        messages={currentSession?.messages || []}
        currentScene={currentScene || null}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        onToggleSidebar={() => setSidebarOpen(true)}
      />
    </div>
  );
}

