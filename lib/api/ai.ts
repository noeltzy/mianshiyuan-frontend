import type {
  InterviewScene,
  ChatSession,
  AIMessage,
  AIResponse,
} from "@/types/ai";

// 面试场景预设数据
export const interviewScenes: InterviewScene[] = [
  {
    id: "frontend",
    name: "前端面试",
    description: "JavaScript、React、Vue、CSS等前端技术面试",
    icon: "🎨",
    systemPrompt:
      "你是一位经验丰富的前端面试官，专注于JavaScript、React、Vue、CSS、HTML5、性能优化等前端技术。请以专业但友好的方式进行面试，根据候选人的回答给出反馈和追问。",
  },
  {
    id: "backend",
    name: "后端面试",
    description: "Java、Spring、数据库、微服务等后端技术面试",
    icon: "⚙️",
    systemPrompt:
      "你是一位资深的后端面试官，专注于Java、Spring Boot、MySQL、Redis、微服务架构等后端技术。请以专业的方式进行面试，深入考察候选人的技术深度和广度。",
  },
  {
    id: "algorithm",
    name: "算法面试",
    description: "数据结构、算法、LeetCode题目等",
    icon: "🧮",
    systemPrompt:
      "你是一位算法面试官，专注于数据结构、算法设计、时间复杂度分析。请出算法题目，引导候选人思考，并在合适的时候给出提示。",
  },
  {
    id: "system-design",
    name: "系统设计",
    description: "高并发、分布式系统、架构设计等",
    icon: "🏗️",
    systemPrompt:
      "你是一位系统设计面试官，专注于分布式系统、高并发架构、缓存策略、消息队列等。请引导候选人进行系统设计讨论，考察其架构思维。",
  },
  {
    id: "resume",
    name: "简历面试",
    description: "上传简历，根据你的经历进行针对性面试",
    icon: "📄",
    systemPrompt:
      "你是一位技术面试官，会根据候选人上传的简历内容，针对其项目经历、技术栈、工作经验进行深入的面试提问和追问。",
  },
];

// 模拟AI回复数据库（按场景分类）
const mockResponses: Record<string, string[]> = {
  frontend: [
    "这是一个很好的问题！让我来考察你对JavaScript闭包的理解。\n\n请问：什么是闭包？能否举一个实际应用场景的例子？",
    "不错的回答！让我们继续深入。\n\n追问：在React中，为什么推荐使用函数组件和Hooks而不是类组件？useState的工作原理是什么？",
    "很好的理解！现在让我们看看你对性能优化的掌握。\n\n问题：假设你有一个渲染大量列表项的React组件，你会采取哪些优化策略来提升性能？",
    "精彩的回答！你对虚拟列表和React.memo的理解很到位。\n\n最后一个问题：请解释一下浏览器的事件循环机制，以及宏任务和微任务的区别。",
  ],
  backend: [
    "欢迎参加后端面试！让我们从基础开始。\n\n问题：请解释一下Spring IoC容器的工作原理，以及依赖注入的几种方式。",
    "回答得很全面！让我们看看你对数据库的理解。\n\n问题：MySQL中的索引是如何工作的？什么情况下索引会失效？",
    "非常好！现在让我们讨论一下分布式系统。\n\n问题：在微服务架构中，如何保证分布式事务的一致性？请介绍几种常见的解决方案。",
    "出色的回答！你对分布式系统有很好的理解。\n\n追问：Redis作为缓存时，如何解决缓存穿透、缓存击穿和缓存雪崩问题？",
  ],
  algorithm: [
    "让我们开始算法面试！\n\n题目：给定一个整数数组，找出其中两个数使得它们的和等于一个目标值。请说明你的思路和时间复杂度。",
    "很好的解法！HashMap确实是最优解。\n\n下一题：请实现一个函数，判断一个链表是否有环。如果有环，找出环的入口节点。",
    "快慢指针是经典解法！\n\n进阶题：给定一个二叉树，请实现层序遍历，要求每一层的节点放在一个数组中。",
    "BFS解法很标准！\n\n最后一题：请设计一个LRU缓存，要求get和put操作的时间复杂度都是O(1)。",
  ],
  "system-design": [
    "欢迎参加系统设计面试！\n\n题目：请设计一个类似微博的社交媒体系统，需要支持发帖、关注、时间线等功能。预计日活用户1000万。",
    "很好的架构思路！让我们深入讨论。\n\n追问：针对时间线功能，你会采用推模式还是拉模式？各有什么优缺点？",
    "分析得很到位！\n\n继续：如何设计系统的缓存策略？热点数据和普通数据应该如何区分处理？",
    "出色的设计！\n\n最后：如果系统需要支持全球用户，你会如何进行多机房部署和数据同步？",
  ],
  resume: [
    "你好！欢迎参加面试。\n\n我已经看过你的简历了。首先，请简单介绍一下你自己，以及你对本次面试岗位的理解。",
    "谢谢你的介绍！\n\n我注意到你简历中提到了一个项目经历，能详细说说你在其中承担的角色和具体贡献吗？",
    "很好的项目经验！\n\n追问：在这个项目中，你遇到的最大技术挑战是什么？你是如何解决的？",
    "不错的问题解决思路！\n\n我看到你的技术栈中包含了几项技术，能深入介绍一下你最擅长的那个吗？",
  ],
};

// 欢迎消息
const welcomeMessages: Record<string, string> = {
  frontend:
    "你好！我是你的前端面试官。今天我们将一起探讨JavaScript、React、Vue等前端技术。\n\n准备好了吗？让我们开始吧！你可以先做一个简单的自我介绍，或者我们直接进入技术问题。",
  backend:
    "你好！我是你的后端面试官。今天我们将讨论Java、Spring、数据库、微服务等后端技术。\n\n准备好了就告诉我，我们可以开始面试了！",
  algorithm:
    "你好！欢迎来到算法面试。我会出一些算法题目来考察你的编程能力和问题解决思维。\n\n你可以使用任何你熟悉的编程语言来解答。准备好了吗？",
  "system-design":
    "你好！我是系统设计面试官。今天我们将讨论分布式系统、高并发架构等话题。\n\n系统设计没有标准答案，重要的是展示你的思考过程。准备好了就开始吧！",
  resume:
    "你好！欢迎参加面试。请先上传你的简历，我会根据你的简历内容进行针对性的面试提问。\n\n你可以点击输入框右侧的上传按钮来上传简历文件。",
};

// 生成唯一ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 获取欢迎消息
export function getWelcomeMessage(sceneId: string): AIMessage {
  const content =
    welcomeMessages[sceneId] ||
    "你好！我是AI面试助手，准备好开始面试了吗？";
  return {
    id: generateId(),
    role: "assistant",
    content,
    timestamp: Date.now(),
  };
}

// 创建新会话
export function createNewSession(sceneId: string): ChatSession {
  const scene = interviewScenes.find((s) => s.id === sceneId);
  const welcomeMessage = getWelcomeMessage(sceneId);

  return {
    id: generateId(),
    title: `${scene?.name || "面试"} - ${new Date().toLocaleDateString()}`,
    sceneId,
    messages: [welcomeMessage],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// 模拟AI响应（带延迟）
export async function sendMessage(
  sessionId: string,
  content: string,
  sceneId: string,
  messageIndex: number
): Promise<AIResponse> {
  // 模拟网络延迟
  await new Promise((resolve) =>
    setTimeout(resolve, 800 + Math.random() * 1200)
  );

  // 获取该场景的预设回复
  const responses = mockResponses[sceneId] || mockResponses["general"];

  // 根据消息索引选择回复（循环使用）
  const responseIndex = messageIndex % responses.length;
  const response = responses[responseIndex];

  return {
    content: response,
    timestamp: Date.now(),
  };
}

// 本地存储相关
const STORAGE_KEY = "ai_chat_sessions";

// 保存会话到本地存储
export function saveSessions(sessions: ChatSession[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }
}

// 从本地存储加载会话
export function loadSessions(): ChatSession[] {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return [];
      }
    }
  }
  return [];
}

// 清除所有会话
export function clearSessions(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}

