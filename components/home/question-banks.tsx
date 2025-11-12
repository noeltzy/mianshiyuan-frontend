"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { useBanks, useTags } from "@/hooks/use-banks";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getBankIcon } from "@/lib/utils/bank";
import type { BankVO } from "@/types";

export function QuestionBanks() {
  const [selectedTag, setSelectedTag] = useState<string | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // 获取标签列表
  const { data: tags = [], isLoading: tagsLoading } = useTags();

  // 获取题库列表
  const {
    data: banksData,
    isLoading: banksLoading,
    error: banksError,
  } = useBanks({
    current: currentPage,
    size: pageSize,
    tag: selectedTag,
  });

  const banks = banksData?.records || [];
  const total = banksData?.total || 0;
  const totalPages = banksData?.pages || Math.ceil(total / pageSize);

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(undefined);
    } else {
      setSelectedTag(tag);
      setCurrentPage(1); // 切换标签时重置到第一页
    }
  };

  return (
    <main className="py-5.5 pb-10">
      <Container>
        <div className="px-4">
          <h2 className="mb-2.5 flex items-center gap-2 text-lg font-extrabold">
            📌 面试题库
          </h2>

          {/* Category Tags */}
          <div className="mb-4 rounded-xl bg-gradient-to-br from-gray-800 to-gray-700 p-4 shadow-lg">
            {tagsLoading ? (
              <div className="mt-3 text-center text-sm text-gray-300">
                加载标签中...
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`flex h-10 w-full items-center justify-center rounded-xl border-none px-3 text-sm font-bold transition-colors ${
                      selectedTag === tag
                        ? "bg-accent text-primary"
                        : "bg-gray-800 text-gray-100 hover:bg-accent hover:text-primary"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Question Bank Grid */}
          {banksLoading ? (
            <div className="mt-4 text-center text-gray-500">加载中...</div>
          ) : banksError ? (
            <div className="mt-4 text-center text-red-500">
              加载失败，请稍后重试
            </div>
          ) : banks.length === 0 ? (
            <div className="mt-4 text-center text-gray-500">
              {selectedTag
                ? `没有找到标签为 "${selectedTag}" 的题库`
                : "暂无题库"}
            </div>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] xl:grid-cols-4">
                {banks.map((bank: BankVO) => (
                  <Link
                    key={bank.id}
                    href={`/questions/${bank.id}`}
                    className="flex items-center gap-4 rounded-xl bg-white p-5 text-primary shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <Avatar className="h-16 w-16 flex-shrink-0 rounded-[10px]">
                      <AvatarImage
                        src={bank.coverImage}
                        alt={bank.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="rounded-[10px] bg-yellow-100 text-base font-extrabold text-yellow-900">
                        {getBankIcon(bank.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[15px] font-extrabold leading-tight">
                        {bank.name}
                      </div>
                      <div className="mt-1.5 truncate text-xs text-gray-500">
                        {bank.description || "暂无描述"}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* 分页控件 */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    上一页
                  </button>
                  <span className="px-4 text-sm text-gray-600">
                    第 {currentPage} / {totalPages} 页（共 {total} 条）
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    下一页
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </Container>
    </main>
  );
}
