import type { ReactNode } from "react";
import { Container } from "./container";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * 页面布局骨架组件
 * 提供统一的页面布局结构
 */
export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <Container variant="default" className={className}>
      <div className="px-4">{children}</div>
    </Container>
  );
}
