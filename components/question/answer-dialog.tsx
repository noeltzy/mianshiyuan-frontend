"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { submitQuestionAnswer } from "@/lib/api/question";

interface AnswerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionId: number;
  questionTitle: string;
  onSubmitSuccess?: () => void;
  refetchComments?: () => void;
}

interface SubmitAnswerRequest {
  content: string;
  commentType?: number;
  parentId?: number;
}

export function AnswerDialog({ 
  open, 
  onOpenChange, 
  questionId, 
  questionTitle,
  onSubmitSuccess,
  refetchComments
}: AnswerDialogProps) {
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!answer.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await submitQuestionAnswer(questionId, answer.trim());
      
      if (response.code === 0) {
        // 清空输入
        setAnswer("");
        onOpenChange(false);
        
        // 通知父组件刷新数据
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }
        
        // 刷新评论数据
        if (refetchComments) {
          refetchComments();
        }
        
        console.log("答案提交成功");
      } else {
        throw new Error(response.message || '提交失败');
      }
    } catch (error) {
      console.error('提交答案失败:', error);
      // 这里可以显示错误提示
      alert('提交答案失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setAnswer("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>回答题目</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              题目: {questionTitle}
            </h3>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              你的答案
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="请输入你的答案..."
              className="w-full h-40 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!answer.trim() || isSubmitting}
          >
            {isSubmitting ? "提交中..." : "提交答案"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
