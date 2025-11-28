"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/layout/hero";
import { QuestionBanks } from "@/components/home/question-banks";
import { AuthDialog } from "@/components/auth/auth-dialog";

export default function HomePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  useEffect(() => {
    // 检查 URL 参数，如果有 showLogin=true，则打开登录弹窗
    if (searchParams.get("showLogin") === "true") {
      setAuthDialogOpen(true);
      // 清除 URL 参数
      router.replace("/", { scroll: false });
    }
  }, [searchParams, router]);

  return (
    <>
      <Navbar />
      <Hero />
      <QuestionBanks />
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </>
  );
}

