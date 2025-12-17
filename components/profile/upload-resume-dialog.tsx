"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileUp, File, X, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getPdfUploadCredentials } from "@/lib/api/file";
import { updateResume } from "@/lib/api/user";
import { uploadPdfToOss } from "@/lib/oss/upload-pdf";
import { getCurrentUser } from "@/lib/api/auth";
import { useUserStore } from "@/store/user-store";

interface UploadResumeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function UploadResumeDialog({
  open,
  onOpenChange,
}: UploadResumeDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { setUser } = useUserStore();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (file.type !== "application/pdf") {
      toast({
        title: "文件格式错误",
        description: "请选择 PDF 格式的文件",
        variant: "destructive",
      });
      return;
    }

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "文件过大",
        description: "文件大小不能超过 10MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setUploadSuccess(false);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // 1. 获取上传凭证
      const credentials = await getPdfUploadCredentials();

      // 2. 上传到 OSS
      const { objectName } = await uploadPdfToOss(selectedFile, credentials);

      // 3. 更新简历记录
      await updateResume(objectName);

      // 4. 刷新用户信息
      const updatedUser = await getCurrentUser();
      if (updatedUser) {
        setUser(updatedUser);
      }

      setUploadSuccess(true);
      toast({
        title: "上传成功",
        description: "您的简历已成功上传",
      });

      // 延迟关闭 Dialog
      setTimeout(() => {
        onOpenChange(false);
        // 重置状态
        setSelectedFile(null);
        setUploadSuccess(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }, 1000);
    } catch (error) {
      console.error("上传简历失败:", error);
      toast({
        title: "上传失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isUploading) {
      onOpenChange(newOpen);
      if (!newOpen) {
        // 关闭时重置状态
        setSelectedFile(null);
        setUploadSuccess(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>上传简历</DialogTitle>
          <DialogDescription>
            选择 PDF 格式的简历文件，文件大小不超过 10MB
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 文件选择区域 */}
          <div
            className={`relative rounded-lg border-2 border-dashed p-6 transition-colors ${
              selectedFile
                ? "border-primary bg-primary/5"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            {!selectedFile ? (
              <label className="flex cursor-pointer flex-col items-center">
                <FileUp className="mb-2 h-10 w-10 text-gray-400" />
                <span className="text-sm text-gray-600">点击选择文件</span>
                <span className="mt-1 text-xs text-gray-400">
                  仅支持 PDF 格式
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {uploadSuccess ? (
                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                  ) : (
                    <File className="h-10 w-10 text-primary" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                {!isUploading && !uploadSuccess && (
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="flex-shrink-0 rounded-full p-1 hover:bg-gray-100"
                    aria-label="移除已选择的文件"
                    title="移除已选择的文件"
                  >
                    <X className="h-5 w-5 text-gray-400" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isUploading}
            >
              取消
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading || uploadSuccess}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  上传中...
                </>
              ) : uploadSuccess ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  已完成
                </>
              ) : (
                "上传"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
