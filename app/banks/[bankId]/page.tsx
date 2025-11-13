"use client";

import { Navbar } from "@/components/layout/navbar";
import { Container } from "@/components/layout/container";
import { BankDetail } from "@/components/bank/bank-detail";
import { BankQuestionsList } from "@/components/bank/bank-questions-list";

export default function BankDetailPage({
  params,
}: {
  params: { bankId: string };
}) {
  const bankId = parseInt(params.bankId, 10);

  if (isNaN(bankId)) {
    return (
      <>
        <Navbar />
        <Container variant="default" className="py-8">
          <div className="px-4 max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-red-600">无效的题库ID</p>
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
        <div className="px-4 max-w-6xl mx-auto space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <BankDetail bankId={bankId} />
          </div>
          <BankQuestionsList bankId={bankId} />
        </div>
      </Container>
    </>
  );
}




