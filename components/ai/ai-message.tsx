"use client";

import { cn } from "@/lib/utils";
import type { AIMessage } from "@/types/ai";
import { Bot, User } from "lucide-react";

interface AIMessageProps {
  message: AIMessage;
}

export function AIMessageItem({ message }: AIMessageProps) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-4",
        isUser && "flex-row-reverse"
      )}
    >
      {/* 头像 */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-gradient-to-r from-cyan-500 to-blue-600"
            : "bg-gradient-to-r from-purple-500 to-pink-500"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-white" />
        ) : (
          <Bot className="h-4 w-4 text-white" />
        )}
      </div>

      {/* 消息内容 */}
      <div
        className={cn(
          "flex max-w-[75%] flex-col gap-1",
          isUser && "items-end"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-tr-sm"
              : "bg-gray-100 text-gray-800 rounded-tl-sm"
          )}
        >
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>
        <span className="text-xs text-gray-400 px-1">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

