import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "nav";
}

/**
 * 布局容器组件
 * - default: 3:6:3 比例（左右空白各 3 份，中间内容 6 份）
 * - nav: 0.9:2.2:0.9 比例（Navbar 专用，左右空白更小）
 */
export function Container({
  children,
  className,
  variant = "default",
}: ContainerProps) {
  return (
    <div
      className={cn(
        "w-full",
        // 大屏：使用 grid 布局实现比例
        "lg:grid",
        variant === "nav"
          ? "lg:grid-cols-[0.9fr_2.2fr_0.9fr]" // Navbar: 22.5% / 55% / 22.5%
          : "lg:grid-cols-[1fr_2fr_1fr]", // 内容区: 25% / 50% / 25%
        // 小屏：单列布局
        "max-lg:block",
        className
      )}
    >
      {/* 左侧空白 */}
      <div className="hidden lg:block" aria-hidden="true" />
      
      {/* 中间内容区域 */}
      <div className="lg:col-start-2">{children}</div>
      
      {/* 右侧空白 */}
      <div className="hidden lg:block" aria-hidden="true" />
    </div>
  );
}

