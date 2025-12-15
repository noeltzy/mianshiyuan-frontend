"use client";

import { useRef, useEffect } from "react";
import { AIMessageItem } from "./ai-message";
import { AIInput } from "./ai-input";
import type { AIMessage, InterviewScene } from "@/types/ai";
import { Bot, Menu, Sparkles } from "lucide-react";

interface AIChatProps {
  messages: AIMessage[];
  currentScene: InterviewScene | null;
  isLoading: boolean;
  onSendMessage: (content: string) => void;
  onToggleSidebar: () => void;
}

export function AIChat({
  messages,
  currentScene,
  isLoading,
  onSendMessage,
  onToggleSidebar,
}: AIChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-1 flex-col">
      {/* 头部 */}
      <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-800">
              {currentScene?.name || "AI 面试助手"}
            </h1>
            <p className="text-xs text-gray-500">
              {currentScene?.description || "智能模拟面试，助你提升面试能力"}
            </p>
          </div>
        </div>
      </div>

      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
        {messages.length === 0 ? (
          <EmptyState sceneName={currentScene?.name} />
        ) : (
          <div className="mx-auto max-w-3xl py-4">
            {messages.map((message) => (
              <AIMessageItem key={message.id} message={message} />
            ))}
            {isLoading && <LoadingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <AIInput onSend={onSendMessage} isLoading={isLoading} />
    </div>
  );
}

function EmptyState({ sceneName }: { sceneName?: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-blue-500/30">
        <Sparkles className="h-10 w-10 text-white" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-gray-800">
        欢迎使用 AI 面试助手
      </h2>
      <p className="mb-6 max-w-md text-gray-500">
        {sceneName
          ? `已选择「${sceneName}」模式，准备好开始面试了吗？`
          : "选择一个面试场景，开始你的模拟面试之旅"}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <FeatureTag icon="🎯" text="真实面试体验" />
        <FeatureTag icon="💡" text="智能追问反馈" />
        <FeatureTag icon="📚" text="覆盖主流技术栈" />
      </div>
    </div>
  );
}

function FeatureTag({ icon, text }: { icon: string; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-600">
      <span>{icon}</span>
      {text}
    </span>
  );
}

function LoadingIndicator() {
  return (
    <div className="flex gap-3 px-4 py-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3">
        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
      </div>
    </div>
  );
}

