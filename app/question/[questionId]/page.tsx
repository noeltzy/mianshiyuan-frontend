"use client";

import { Navbar } from "@/components/layout/navbar";
import { Container } from "@/components/layout/container";
import { QuestionDetail } from "@/components/question/question-detail";
import { BankQuestionNav } from "@/components/question/bank-question-nav";
import { useSearchParams } from "next/navigation";

export default function QuestionDetailPage({
  params,
}: {
  params: { questionId: string };
}) {
  const questionId = parseInt(params.questionId, 10);
  const searchParams = useSearchParams();
  const bankId = searchParams.get("bankId");

  if (isNaN(questionId)) {
    return (
      <>
        <Navbar />
        <Container variant="default" className="py-8">
          <div className="mx-auto max-w-6xl px-4">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-red-600">无效的题目ID</p>
            </div>
          </div>
        </Container>
      </>
    );
  }

  // 如果有bankId，使用leftSlot显示题目导航
  if (bankId) {
    const bankIdNum = parseInt(bankId, 10);

    return (
      <>
        <Navbar />
        <Container
          variant="default"
          className="py-8"
          leftSlot={
            <div className="h-full">
              <BankQuestionNav
                bankId={bankIdNum}
                currentQuestionId={questionId}
              />
            </div>
          }
        >
          <div className="mx-auto max-w-6xl px-4">
            <QuestionDetail
              questionId={questionId}
              bankId={bankId || undefined}
            />
          </div>
        </Container>
      </>
    );
  }

  // 没有bankId时，使用原来的布局
  return (
    <>
      <Navbar />
      <Container variant="default" className="py-8">
        <div className="mx-auto max-w-6xl px-4">
          <QuestionDetail
            questionId={questionId}
            bankId={bankId || undefined}
          />
        </div>
      </Container>
    </>
  );
}
