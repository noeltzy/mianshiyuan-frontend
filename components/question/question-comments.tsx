"use client";

import Image from "next/image";
import { useState, forwardRef, useImperativeHandle } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQuestionComments, submitQuestionComment } from "@/lib/api/question";
import { useCurrentUser } from "@/hooks/use-auth";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { MessageCircle, Heart, Send, User } from "lucide-react";
import type { CommentVO } from "@/types";

interface QuestionCommentsProps {
  questionId: number;
}

interface CommentItemProps {
  comment: CommentVO;
  onReply?: (comment: CommentVO) => void;
  isRootComment?: boolean;
  level?: number;
}

// 格式化相对时间
function formatRelativeTime(dateString?: string): string {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "刚刚";
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}分钟前`;
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}小时前`;
  } else if (diffInSeconds < 2592000) {
    return `${Math.floor(diffInSeconds / 86400)}天前`;
  } else {
    return date.toLocaleDateString("zh-CN");
  }
}

// 根据评论类型获取标签信息
function getCommentTypeInfo(commentType?: number) {
  switch (commentType) {
    case 3:
      return { text: "AI", className: "bg-blue-100 text-blue-700" };
    case 1:
      return { text: "回答", className: "bg-green-100 text-green-700" };
    case 2:
      return { text: "评论", className: "bg-purple-100 text-purple-700" };
    default:
      return { text: "讨论", className: "bg-gray-100 text-gray-700" };
  }
}

function CommentItem({
  comment,
  onReply,
  isRootComment = true,
  level = 1,
}: CommentItemProps) {
  const commentTypeInfo = getCommentTypeInfo(comment.commentType);
  const isSubComment = level > 1; // 判断是否是子评论

  return (
    <div
      className={`flex space-x-3 ${isSubComment ? "ml-6 border-l-2 border-gray-200 pl-4" : ""}`}
    >
      <Avatar className="h-8 w-8 flex-shrink-0">
        <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-200">
          {comment.userVO.avatarUrl ? (
            <Image
              src={comment.userVO.avatarUrl}
              alt={comment.userVO.username}
              fill
              className="rounded-full object-cover"
              sizes="32px"
            />
          ) : (
            <User className="h-4 w-4 text-gray-500" />
          )}
        </div>
      </Avatar>

      <div className="flex-1 space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-900">
            {comment.userVO.nickname || comment.userVO.username}
          </span>

          {/* 根评论才显示评论类型标签 */}
          {isRootComment && (
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${commentTypeInfo.className}`}
            >
              {commentTypeInfo.text}
            </span>
          )}

          <span className="text-xs text-gray-500">
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>

        <div className="text-sm text-gray-700">{comment.content}</div>

        <div className="flex items-center space-x-4">
          {/* 根评论才显示点赞数 */}
          {isRootComment && (
            <button className="inline-flex items-center space-x-1 text-xs text-gray-500 transition-colors hover:text-red-500">
              <Heart className="h-3 w-3" />
              <span>{comment.likeCount || 0}</span>
            </button>
          )}

          {/* 允许所有评论显示回复按钮，但回复的始终是根评论 */}
          {onReply && (
            <button
              onClick={() => onReply(comment)}
              className="text-xs text-gray-500 transition-colors hover:text-blue-500"
            >
              回复
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export const QuestionComments = forwardRef<
  { refetch: () => void },
  QuestionCommentsProps
>(({ questionId }, ref) => {
  const [newComment, setNewComment] = useState("");
  const [replyToComment, setReplyToComment] = useState<CommentVO | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 获取当前用户登录状态
  const { data: currentUser } = useCurrentUser();
  const isLoggedIn = !!currentUser;

  // 获取评论列表
  const {
    data: comments,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["questionComments", questionId],
    queryFn: () => getQuestionComments(questionId),
    enabled: isLoggedIn, // 只有登录用户才能查看评论
  });

  // 暴露refetch方法给父组件
  useImperativeHandle(ref, () => ({
    refetch,
  }));

  // 处理发表评论
  const handleSubmitComment = async () => {
    if (!isLoggedIn) {
      setShowAuthDialog(true);
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // 调用API提交评论，commentType: 2 表示评论
      await submitQuestionComment(
        questionId,
        newComment.trim(),
        replyToComment?.id, // 如果是回复，传入parentId
        2 // 评论类型
      );

      // 清空输入和状态
      setNewComment("");
      setReplyToComment(null);

      // 刷新评论列表
      refetch();

      console.log(replyToComment ? "回复成功" : "评论成功");
    } catch (error) {
      console.error("发表评论失败:", error);
      // 这里可以添加更好的错误处理，比如显示toast提示
      alert(replyToComment ? "回复失败，请稍后重试" : "评论失败，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理回复
  const handleReply = (comment: CommentVO) => {
    if (!isLoggedIn) {
      setShowAuthDialog(true);
      return;
    }

    // 只允许回复根节点评论（没有parentId的评论）
    if (comment.parentId != null) {
      alert("只能回复根节点评论");
      return;
    }

    setReplyToComment(comment);
  };

  // 取消回复
  const cancelReply = () => {
    setReplyToComment(null);
  };

  // 处理评论数据：后端返回的是嵌套结构，直接使用即可
  const processComments = (comments: CommentVO[] = []) => {
    // 调试：打印评论数据结构
    if (comments.length > 0) {
      console.log("评论数据调试信息:", {
        total: comments.length,
        sample: comments[0],
        hasChildren: comments.map((c) => ({
          id: c.id,
          childrenCount: c.children?.length || 0,
          children: c.children,
        })),
      });
    }

    // 给根评论按置顶状态和创建时间排序
    const sortedComments = [...comments].sort((a, b) => {
      // 置顶评论优先
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // 都是置顶或都不是置顶，按创建时间倒序
      return (
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
      );
    });

    // 给每个根评论的子评论按创建时间排序
    sortedComments.forEach((comment) => {
      if (comment.children && comment.children.length > 0) {
        comment.children.sort(
          (a, b) =>
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime()
        );
      }
    });

    // 调试：打印处理结果
    const totalChildren = sortedComments.reduce(
      (sum, c) => sum + (c.children?.length || 0),
      0
    );
    console.log("评论处理结果:", {
      rootCount: sortedComments.length,
      totalChildren,
    });

    return sortedComments;
  };

  // 如果用户未登录，显示登录提示
  if (!isLoggedIn) {
    return (
      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5 text-gray-500" />
          <h2 className="text-xl font-semibold text-gray-900">评论</h2>
        </div>

        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <MessageCircle className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="mb-4 text-gray-600">登录后查看和参与评论</p>
            <Button onClick={() => setShowAuthDialog(true)}>立即登录</Button>
          </div>
        </div>

        <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center space-x-2">
        <MessageCircle className="h-5 w-5 text-gray-500" />
        <h2 className="text-xl font-semibold text-gray-900">
          评论 ({comments?.length || 0})
        </h2>
      </div>

      {/* 发表评论输入框 */}
      <div className="space-y-3">
        {replyToComment && (
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                回复{" "}
                <span className="font-medium">
                  {replyToComment.userVO.nickname ||
                    replyToComment.userVO.username}
                </span>
              </span>
              <button
                onClick={cancelReply}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                取消回复
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-700">
              {replyToComment.content}
            </p>
          </div>
        )}

        <div className="flex space-x-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-200">
              {currentUser?.avatarUrl ? (
                <Image
                  src={currentUser.avatarUrl}
                  alt={currentUser.username}
                  fill
                  className="rounded-full object-cover"
                  sizes="32px"
                />
              ) : (
                <User className="h-4 w-4 text-gray-500" />
              )}
            </div>
          </Avatar>

          <div className="flex-1 space-y-2">
            <textarea
              placeholder={
                replyToComment ? "写下你的回复..." : "写下你的评论..."
              }
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full resize-none rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex justify-end">
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
                size="sm"
                className="flex items-center space-x-1"
              >
                <Send className="h-3 w-3" />
                <span>
                  {isSubmitting
                    ? replyToComment
                      ? "回复中..."
                      : "发布中..."
                    : replyToComment
                      ? "回复"
                      : "发布"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200" />

      {/* 评论列表 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent"></div>
            <p className="mt-2 text-sm text-gray-600">加载评论中...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-red-600">加载评论失败</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => refetch()}
            >
              重试
            </Button>
          </div>
        </div>
      ) : !comments || comments.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <MessageCircle className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="text-gray-600">暂无评论，来发表第一个评论吧！</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {processComments(comments).map((rootComment) => (
            <div key={rootComment.id} className="space-y-4">
              {/* 根评论 */}
              <CommentItem
                comment={rootComment}
                onReply={handleReply}
                isRootComment={true}
                level={1}
              />

              {/* 子评论（使用后端返回的 children 数组） */}
              {rootComment.children && rootComment.children.length > 0
                ? rootComment.children.map((childComment) => (
                    <CommentItem
                      key={childComment.id}
                      comment={childComment}
                      isRootComment={false}
                      level={2}
                    />
                  ))
                : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

QuestionComments.displayName = "QuestionComments";
