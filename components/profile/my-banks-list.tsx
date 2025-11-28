"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { listMyBanks } from "@/lib/api/bank";

// 状态映射
const statusMap: Record<number, { label: string; className: string }> = {
  0: { label: "草稿", className: "bg-gray-100 text-gray-700" },
  1: { label: "待审核", className: "bg-yellow-100 text-yellow-700" },
  2: { label: "已发布", className: "bg-green-100 text-green-700" },
  3: { label: "已拒绝", className: "bg-red-100 text-red-700" },
};

// 公开状态映射
const publicMap: Record<number, { label: string; className: string }> = {
  0: { label: "私密", className: "bg-gray-100 text-gray-600" },
  1: { label: "公开", className: "bg-blue-100 text-blue-700" },
};

// 截断文本到一行
function truncateText(text: string, maxLength: number = 100): string {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + "...";
}

// 格式化时间
function formatTime(dateString?: string): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return "";
  }
}

const pageSize = 4;

export function MyBanksList() {
  const [currentPage, setCurrentPage] = useState(1);

  // 查询当前页数据
  const { data, isLoading } = useQuery({
    queryKey: ["myBanks", currentPage],
    queryFn: () =>
      listMyBanks({
        current: currentPage,
        size: pageSize,
      }),
  });

  const banks = data?.records || [];
  const totalPages = data?.pages || (data ? Math.ceil(data.total / pageSize) : 0);

  return (
    <>
      {/* 加载状态 */}
      {isLoading ? (
        <div className="py-8 text-center text-gray-600">加载中...</div>
      ) : banks.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          <p>暂无创建的题库</p>
          <p className="text-sm mt-2">开始创建题库来展示您的作品吧！</p>
        </div>
      ) : (
        <div className="w-full">
          <table className="w-full table-fixed">
            <tbody className="bg-white divide-y divide-gray-200">
              {banks.map((bank) => {
                const status =
                  bank.status !== undefined
                    ? statusMap[bank.status] || {
                        label: "未知",
                        className: "bg-gray-100 text-gray-600",
                      }
                    : {
                        label: "未知",
                        className: "bg-gray-100 text-gray-600",
                      };

                const publicStatus =
                  bank.isPublic !== undefined
                    ? publicMap[bank.isPublic] || publicMap[0]
                    : publicMap[0];

                return (
                  <tr key={bank.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link
                        href={`/banks/${bank.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-primary hover:underline text-left block"
                      >
                        {bank.id}. {bank.name}
                      </Link>
                      {bank.description && (
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {truncateText(bank.description, 100)}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${status.className}`}
                        >
                          {status.label}
                        </span>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${publicStatus.className}`}
                        >
                          {publicStatus.label}
                        </span>
                        {bank.createdAt && (
                          <span className="text-xs text-gray-500 ml-auto">
                            {formatTime(bank.createdAt)}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4 pb-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            上一页
          </button>
          <span className="text-sm text-gray-600">
            第 {currentPage} / {totalPages} 页（共 {data?.total || 0} 个题库）
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      )}
    </>
  );
}
