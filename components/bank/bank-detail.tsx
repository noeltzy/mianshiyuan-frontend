"use client";

import { useQuery } from "@tanstack/react-query";
import { getBankById } from "@/lib/api/bank";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getBankIcon } from "@/lib/utils/bank";

interface BankDetailProps {
  bankId: number;
}

export function BankDetail({ bankId }: BankDetailProps) {
  const { data: bank, isLoading, error } = useQuery({
    queryKey: ["bank", bankId],
    queryFn: () => getBankById(bankId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-600">加载失败</p>
          <p className="mt-2 text-gray-600">
            {error instanceof Error ? error.message : "未知错误"}
          </p>
        </div>
      </div>
    );
  }

  if (!bank) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">题库不存在</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* 左侧：封面图片，占 3 份，垂直居中 */}
      <div className="flex w-3/12 items-center justify-center overflow-hidden">
        <Avatar className="h-auto w-full max-h-64 rounded-xl">
          <AvatarImage
            src={bank.coverImage}
            alt={bank.name}
            className="h-full w-full object-cover"
          />
          <AvatarFallback className="rounded-xl bg-yellow-100 text-4xl font-extrabold text-yellow-900">
            {getBankIcon(bank.name)}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* 右侧：信息区域，占 9 份 */}
      <div className="flex w-9/12 flex-col">
        {/* 垂直等分 3 份 */}
        <div className="flex h-full flex-col justify-between">
          {/* 第一行：名称 */}
          <div className="flex flex-1 items-center">
            <h1 className="text-3xl font-bold text-gray-900">{bank.name}</h1>
          </div>

          {/* 第二行：描述 */}
          <div className="flex flex-1 items-center">
            <p className="text-base text-gray-600">
              {bank.description || "暂无描述"}
            </p>
          </div>

          {/* 第三行：按钮区和标签 */}
          <div className="flex flex-1 items-center justify-between">
            {/* 左侧：预留按钮区（左对齐，适当间隔） */}
            <div className="flex items-center gap-3">
              {/* 预留按钮区域，后续可以添加按钮 */}
            </div>

            {/* 右侧：标签（右对齐，适当间隔） */}
            <div className="flex items-center gap-2">
              {bank.tagList && bank.tagList.length > 0 ? (
                bank.tagList.map((tag, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-400">暂无标签</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

