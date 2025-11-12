import { useQuery } from "@tanstack/react-query";
import { listBanks, getAllTags } from "@/lib/api/bank";
import type { BankQueryParams } from "@/types";

/**
 * 获取题库列表的 Hook
 */
export function useBanks(params?: BankQueryParams) {
  return useQuery({
    queryKey: ["banks", params],
    queryFn: () => listBanks(params),
    staleTime: 60 * 1000, // 1 分钟
  });
}

/**
 * 获取所有标签的 Hook
 */
export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: getAllTags,
    staleTime: 5 * 60 * 1000, // 5 分钟
  });
}

