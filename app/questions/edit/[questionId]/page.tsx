"use client";

import { useParams } from "next/navigation";
import { AddQuestionPage } from "@/components/questions/add-question-page";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function EditQuestionPageRoute() {
  const params = useParams();
  const questionId = params.questionId
    ? Number(params.questionId)
    : undefined;

  if (!questionId || isNaN(questionId)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">无效的题目ID</p>
      </div>
    );
  }

  return (
    <AuthGuard>
      <AddQuestionPage questionId={questionId} />
    </AuthGuard>
  );
}

