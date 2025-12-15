"use client";

import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";
import type { InterviewScene } from "@/types/ai";

interface InterviewScenesProps {
  scenes: InterviewScene[];
  currentSceneId: string;
  onSceneChange: (sceneId: string) => void;
  onUploadClick?: () => void;
}

export function InterviewScenes({
  scenes,
  currentSceneId,
  onSceneChange,
  onUploadClick,
}: InterviewScenesProps) {
  return (
    <div className="space-y-1">
      <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
        面试场景
      </h3>
      {scenes.map((scene) => {
        const isActive = currentSceneId === scene.id;
        const isResume = scene.id === "resume";

        return (
          <button
            key={scene.id}
            onClick={() => onSceneChange(scene.id)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
              isActive
                ? "bg-gradient-to-r from-cyan-50 to-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <span className="text-base">{scene.icon}</span>
            <span className={cn("flex-1 truncate", isActive && "font-medium")}>
              {scene.name}
            </span>
            {/* 右侧操作区域 - 固定宽度保持对齐 */}
            <div className="w-6 flex items-center justify-center shrink-0">
              {isResume ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUploadClick?.();
                  }}
                  className="rounded p-0.5 text-gray-400 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                  title="上传简历"
                >
                  <Upload className="h-4 w-4" />
                </button>
              ) : isActive ? (
                <div className="h-2 w-2 rounded-full bg-blue-500" />
              ) : null}
            </div>
          </button>
        );
      })}
    </div>
  );
}

