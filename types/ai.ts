// AI 面试相关类型定义

// 面试场景类型
export interface InterviewScene {
  id: string;
  name: string;
  description: string;
  icon: string;
  systemPrompt: string;
}

// 消息角色
export type MessageRole = "user" | "assistant" | "system";

// 单条消息
export interface AIMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
}

// 对话会话
export interface ChatSession {
  id: string;
  title: string;
  sceneId: string;
  messages: AIMessage[];
  createdAt: number;
  updatedAt: number;
}

// 发送消息请求
export interface SendMessageRequest {
  sessionId: string;
  content: string;
  sceneId: string;
}

// AI 响应
export interface AIResponse {
  content: string;
  timestamp: number;
}

// 对话状态
export interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  isLoading: boolean;
}

