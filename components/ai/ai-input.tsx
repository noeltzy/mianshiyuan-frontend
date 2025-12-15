"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function AIInput({ onSend, isLoading, disabled }: AIInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整高度
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (trimmed && !isLoading && !disabled) {
      onSend(trimmed);
      setValue("");
      // 重置高度
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter 发送，Shift+Enter 换行
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 shadow-sm transition-colors focus-within:border-blue-400 focus-within:bg-white">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你的回答... (Enter 发送，Shift+Enter 换行)"
            disabled={isLoading || disabled}
            rows={1}
            className={cn(
              "flex-1 resize-none bg-transparent text-sm leading-relaxed placeholder:text-gray-400 focus:outline-none",
              "max-h-[200px] min-h-[24px]",
              (isLoading || disabled) && "cursor-not-allowed opacity-50"
            )}
          />
          <Button
            onClick={handleSubmit}
            disabled={!value.trim() || isLoading || disabled}
            size="icon"
            className={cn(
              "h-9 w-9 shrink-0 rounded-xl transition-all",
              value.trim() && !isLoading
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-md"
                : "bg-gray-300"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="mt-2 text-center text-xs text-gray-400">
          AI 面试助手可能会产生不准确的信息，请以实际知识为准
        </p>
      </div>
    </div>
  );
}

