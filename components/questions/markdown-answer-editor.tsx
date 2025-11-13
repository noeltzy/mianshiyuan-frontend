"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

import { getImageUploadCredentials } from "@/lib/api/file";
import { uploadImageToOss } from "@/lib/oss/upload-image";
import type { StsCredentials } from "@/types";
import { cn } from "@/lib/utils";
import { Image as ImageIcon } from "lucide-react";
import type { ICommand } from "@uiw/react-md-editor";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
});
const commandsPromise = import("@uiw/react-md-editor").then(
  (module) => module.commands
);

type CommandsModule = typeof import("@uiw/react-md-editor")["commands"];

function isCredentialsValid(credentials: StsCredentials | null): boolean {
  if (!credentials) {
    return false;
  }
  const expirationTime = new Date(credentials.expiration).getTime();
  // 提前 1 分钟刷新
  return expirationTime - Date.now() > 60_000;
}

export interface MarkdownAnswerEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  className?: string;
}

export function MarkdownAnswerEditor({
  value,
  onChange,
  placeholder,
  height = 400,
  className,
}: MarkdownAnswerEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [commands, setCommands] = useState<CommandsModule | null>(null);
  const credentialsRef = useRef<StsCredentials | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    commandsPromise.then(setCommands).catch((error) => {
      console.error("加载 Markdown 编辑器命令失败", error);
    });
  }, []);

  const resolveCredentials = useCallback(async () => {
    if (!isCredentialsValid(credentialsRef.current)) {
      const credentials = await getImageUploadCredentials();
      credentialsRef.current = credentials;
    }
    return credentialsRef.current as StsCredentials;
  }, []);

  const handleImageUpload = useCallback(
    async (file: File) => {
      setUploadError(null);
      if (!file.type.startsWith("image/")) {
        const message = "仅支持上传图片文件";
        setUploadError(message);
        throw new Error(message);
      }

      setIsUploading(true);
      try {
        const credentials = await resolveCredentials();
        const url = await uploadImageToOss(file, credentials);
        return url;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "图片上传失败，请稍后重试";
        setUploadError(message);
        throw error instanceof Error ? error : new Error(message);
      } finally {
        setIsUploading(false);
      }
    },
    [resolveCredentials]
  );

  const handleChange = useCallback(
    (nextValue?: string) => {
      onChange(nextValue ?? "");
    },
    [onChange]
  );

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }
      try {
        const url = await handleImageUpload(file);
        const altText = file.name.replace(/\.[^/.]+$/, "");
        const imageMarkdown = `![${altText}](${url})`;
        const nextValue = value
          ? `${value.replace(/\s*$/, "")}\n\n${imageMarkdown}\n`
          : `${imageMarkdown}\n`;
        onChange(nextValue);
      } catch (error) {
        console.error("图片上传失败", error);
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [handleImageUpload, onChange, value]
  );

  const requestSelectFile = useCallback(() => {
    console.log("requestSelectFile 被调用", fileInputRef.current);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    } else {
      console.error("fileInputRef.current 为 null");
    }
  }, []);

  const toolbarCommands = useMemo(() => {
    if (!commands) {
      return undefined;
    }
    const customImageCommand: ICommand = {
      name: "image-upload",
      keyCommand: "image-upload",
      buttonProps: {
        "aria-label": "插入图片",
        title: isUploading ? "图片上传中..." : "插入图片",
      },
      icon: <ImageIcon className="h-4 w-4" />,
      executeCommand: (state, api) => {
        if (!isUploading) {
          requestSelectFile();
        }
      },
      render: (command, disabled, executeCommand) => {
        return (
          <button
            type="button"
            style={{
              padding: "4px 8px",
              border: "none",
              background: "transparent",
              cursor: disabled || isUploading ? "not-allowed" : "pointer",
              opacity: disabled || isUploading ? 0.5 : 1,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            disabled={disabled || isUploading}
            aria-label="插入图片"
            title={isUploading ? "图片上传中..." : "插入图片"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("图片上传按钮被点击", { disabled, isUploading });
              if (!disabled && !isUploading) {
                requestSelectFile();
              }
            }}
          >
            <ImageIcon className="h-4 w-4" />
          </button>
        );
      },
    };

    return [
      commands.title,
      commands.bold,
      commands.italic,
      commands.strikethrough,
      commands.hr,
      commands.divider,
      commands.link,
      commands.quote,
      commands.code,
      commands.codeBlock,
      commands.divider,
      commands.unorderedList,
      commands.orderedList,
      commands.checkedList,
      commands.table,
      commands.divider,
      customImageCommand,
    ];
  }, [commands, isUploading, requestSelectFile]);

  const extraCommands = useMemo(() => {
    if (!commands) {
      return undefined;
    }
    return [
      commands.codePreview,
      commands.preview,
      commands.fullscreen,
    ];
  }, [commands]);

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <div
        data-color-mode="light"
        className="overflow-hidden rounded-lg border border-gray-200 shadow-sm"
      >
        <MDEditor
          value={value}
          onChange={handleChange}
          preview="live"
          height={height}
          textareaProps={{
            placeholder,
          }}
          visibleDragbar={false}
          fullscreen={false}
          onImageUpload={handleImageUpload}
          commands={toolbarCommands}
          extraCommands={extraCommands}
        />
      </div>

      <div className="min-h-[20px]">
        {isUploading && (
          <p className="text-sm text-gray-500">图片上传中，请稍候…</p>
        )}
        {uploadError && (
          <p className="text-sm text-red-500">{uploadError}</p>
        )}
      </div>
    </div>
  );
}


