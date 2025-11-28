import { Button } from "@/components/ui/button";
import { Container } from "./container";
import Image from "next/image";

export function Hero() {
  return (
    <section className="bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      <Container>
        <div className="px-4">
          <div className="py-8 md:py-12">
            <div className="flex items-center justify-between gap-8">
              {/* 左侧图片 */}
              <div className="hidden lg:block flex-shrink-0">
                <div className="relative w-48 h-48 xl:w-56 xl:h-56">
                  <Image
                    src="/images/hero-left.png"
                    alt="AI Assistant"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>

              {/* 中间内容 */}
              <div className="flex-1 text-center">
                <h1 className="text-3xl font-extrabold tracking-wide md:text-4xl lg:text-5xl bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  面试八股文智能刷题平台
                </h1>
                <p className="mt-3 text-base md:text-lg text-gray-600 font-medium">
                  理论精通 • 概念理解 • 面试必备
                </p>
                <div className="mt-6 inline-flex gap-4">
                  <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/30 transition-all duration-300">
                    每日一题
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-2 border-purple-500 text-purple-600 hover:bg-purple-50 hover:border-purple-600 shadow-md transition-all duration-300"
                  >
                    AI 陪练
                  </Button>
                </div>
              </div>

              {/* 右侧图片 */}
              <div className="hidden lg:block flex-shrink-0">
                <div className="relative w-48 h-48 xl:w-56 xl:h-56">
                  <Image
                    src="/images/hero-right.png"
                    alt="AI Assistant"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* 移动端显示图片 */}
            <div className="lg:hidden mt-8 flex justify-center gap-8">
              <div className="relative w-32 h-32 sm:w-40 sm:h-40">
                <Image
                  src="/images/hero-left.png"
                  alt="AI Assistant"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="relative w-32 h-32 sm:w-40 sm:h-40">
                <Image
                  src="/images/hero-right.png"
                  alt="AI Assistant"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

