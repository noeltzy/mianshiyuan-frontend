import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/layout/hero";
import { QuestionBanks } from "@/components/home/question-banks";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <QuestionBanks />
    </>
  );
}

