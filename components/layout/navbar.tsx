"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUserStore } from "@/store/user-store";
import { useCurrentUser } from "@/hooks/use-auth";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { UserMenu } from "@/components/auth/user-menu";
import { cn } from "@/lib/utils";
import { Container } from "./container";

const navLinks = [
  { href: "/", label: "主页" },
  { href: "/ai", label: "AI" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user } = useUserStore();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  // 自动获取当前用户信息（如果有 token）
  useCurrentUser();

  return (
    <>
      <header className="border-b border-gray-200 bg-white">
        <Container variant="nav">
          <div className="px-4">
            <div className="flex h-16 items-center justify-between gap-6 flex-wrap md:flex-nowrap">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2.5 font-bold">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-sm text-white">
                  猿
                </span>
                <span className="whitespace-nowrap">面试猿刷题</span>
              </Link>

              {/* Navigation Links */}
              <nav className="flex items-center gap-5 flex-shrink-0 order-3 w-full justify-center md:order-none md:w-auto md:justify-start">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "relative px-2.5 py-2 rounded-lg transition-colors",
                        isActive
                          ? "text-primary"
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      {isActive && (
                        <span className="absolute left-2 right-2 bottom-1.5 h-2.5 bg-accent rounded-md -z-0" />
                      )}
                      <span className={cn("relative z-10", isActive && "z-10")}>
                        {link.label}
                      </span>
                    </Link>
                  );
                })}
              </nav>

              {/* Search */}
              <div className="flex flex-1 items-center justify-end min-w-[200px] order-2 w-full justify-center md:order-none md:w-auto md:justify-end">
                <Input
                  type="search"
                  placeholder="搜索题目"
                  aria-label="搜索题目"
                  className="max-w-[260px] w-full md:w-auto"
                />
              </div>

              {/* Account */}
              <div className="inline-flex items-center gap-2.5 pl-2 order-2 w-full justify-center mt-2 md:order-none md:w-auto md:mt-0 md:justify-start">
                {user ? (
                  <UserMenu />
                ) : (
                  <button
                    onClick={() => setAuthDialogOpen(true)}
                    className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-gray-200 text-gray-600 text-xs font-bold border border-gray-300">
                        U
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-gray-700 whitespace-nowrap">
                      未登录
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </Container>
      </header>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </>
  );
}

