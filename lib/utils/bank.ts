import type { BankVO } from "@/types";

/**
 * 根据题库名称生成图标（取前两个字符）
 */
export function getBankIcon(name: string): string {
  if (!name) return "?";
  // 提取中文字符或英文字母
  const chars = name.match(/[\u4e00-\u9fa5a-zA-Z]/g) || [];
  if (chars.length === 0) return name.substring(0, 2).toUpperCase();
  
  // 如果包含中文，取前两个字符
  if (chars.some((c) => /[\u4e00-\u9fa5]/.test(c))) {
    return chars.slice(0, 2).join("");
  }
  
  // 英文取前两个字母大写
  return chars.slice(0, 2).join("").toUpperCase();
}

/**
 * 根据标签生成副标题
 */
export function getBankSubtitle(bank: BankVO): string {
  if (bank.tagList && bank.tagList.length > 0) {
    return bank.tagList.slice(0, 3).join(" / ");
  }
  return bank.description || "面试题库";
}

