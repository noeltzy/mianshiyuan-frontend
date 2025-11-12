import { AddQuestionPage } from "@/components/questions/add-question-page";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function AddQuestionPageRoute() {
  return (
    <AuthGuard>
      <AddQuestionPage />
    </AuthGuard>
  );
}

