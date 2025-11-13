"use client";

import { Navbar } from "@/components/layout/navbar";
import { Container } from "@/components/layout/container";
import { QuestionDetail } from "@/components/question/question-detail";

export default function QuestionDetailPage({
  params,
}: {
  params: { questionId: string };
}) {
  const questionId = parseInt(params.questionId, 10);

  if (isNaN(questionId)) {
    return (
      <>
        <Navbar />
        <Container variant="default" className="py-8">
          <div className="px-4 max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-red-600">无效的题目ID</p>
            </div>
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container variant="default" className="py-8">
        <div className="px-4 max-w-6xl mx-auto">
          <QuestionDetail questionId={questionId} />
        </div>
      </Container>
    </>
  );
}


