"use client";

import { Navbar } from "@/components/layout/navbar";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AIPage } from "@/components/ai";

export default function AIInterviewPage() {
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <AIPage />
      </div>
    </AuthGuard>
  );
}

