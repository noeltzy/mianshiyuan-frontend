import { Button } from "@/components/ui/button";
import { Container } from "./container";

export function Hero() {
  return (
    <section className="bg-white">
      <Container>
        <div className="px-4">
          <div className="py-12 text-center md:py-12">
            <h1 className="text-3xl font-extrabold tracking-wide md:text-[28px]">
              面试八股文智能刷题平台
            </h1>
            <p className="mt-2.5 text-gray-600">理论精通 • 概念理解 • 面试必备</p>
            <div className="mt-5 inline-flex gap-3">
              <Button>每日一题</Button>
              <Button variant="secondary">AI 陪练</Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

