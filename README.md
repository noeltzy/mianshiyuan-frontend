# 面试猿刷题平台

面试八股文智能刷题平台前端项目

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript (严格模式)
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **数据获取**: React Query (@tanstack/react-query)
- **HTTP 客户端**: Axios
- **UI 组件库**: shadcn/ui
- **代码规范**: ESLint + Prettier

## 目录结构

```
├── app/              # 页面路由 (Next.js App Router)
├── components/       # 可复用组件
│   ├── ui/          # shadcn/ui 基础组件
│   ├── layout/      # 布局组件
│   └── home/        # 首页相关组件
├── lib/             # 工具函数和 API 客户端
│   ├── api/         # API 客户端配置
│   └── utils.ts     # 工具函数
├── hooks/           # 自定义 Hooks
├── types/           # TypeScript 类型定义
└── store/           # Zustand 状态管理
```

## 开始使用

### 安装依赖

```bash
npm install
```

### 开发环境

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 构建生产版本

```bash
npm run build
npm start
```

### 代码格式化

```bash
npm run format
```

### 代码检查

```bash
npm run lint
```

## 设计规范

### 主题色

- **主色**: `#111827` (primary)
- **强调色**: `#facc15` (accent)

### 响应式断点

- 移动端: `< 900px`
- 桌面端: `≥ 900px`

## 代码风格

- 使用函数式组件 + Hooks
- TypeScript 严格模式
- 组件 Props 必须有类型定义
- API 调用必须有类型定义
- 遵循 ESLint 和 Prettier 规范

## 环境变量

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

## 项目特性

- ✅ TypeScript 严格模式
- ✅ 响应式设计
- ✅ 代码规范 (ESLint + Prettier)
- ✅ 类型安全
- ✅ 现代化 UI 组件库
- ✅ 状态管理
- ✅ API 客户端封装

