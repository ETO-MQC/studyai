下面这份文档，就是你**可以直接复制给 AI Coding 工具**的终极完整提示词。它基于我们之前反复打磨的三版 `prompts.ts` 精华与完整的全栈架构，并**特别加入了你手动保存的全部 12 个设计参考页面**。AI 将把这些 HTML 文件当作像素级设计稿，读懂其中的布局、配色、交互结构，然后用 Next.js + Tailwind 帮你 1:1 还原。

请一次全部复制，丢给 Cursor、GPT-4 或其他 AI 编码工具，让它直接开工。

---

# 给 AI Coding 的完整项目提示词：本地优先的中文 AI 学习助手（含设计还原）

请根据以下需求，帮我生成一个**全栈、可在本地运行、以教学为核心**的中文 AI 助手网站。你需要同时负责：技术选型、项目结构、所有文件代码、配置、prompts 设计、功能实现，并**严格依据我提供的设计参考 HTML 文件还原界面**。

---

## 一、项目目标与核心特征

构建一个“像优质教学型助手”的本地 AI 应用，支持以下能力：

1.  **通用聊天**（默认模式）
2.  **教学讲解**（遵循固定教学流：结论→类比→例子→拆解→误区→总结）
3.  **内容总结**（结构化摘要）
4.  **自动出题**（输出严格 JSON，前端渲染测验）
5.  **智能闪卡生成**（输出严格 JSON）
6.  **代码辅助**（可运行的代码 + 解释）
7.  **知识库/文件问答（RAG）**（基于上传材料回答）
8.  **文本润色**
9.  **翻译**
10. **对话记忆**（记住偏好、科目等）
11. **流式输出**，体验自然
12. **支持 LaTeX 数学公式、Mermaid 图表**
13. **模式切换**（前端可选择模式驱动不同 system prompt）
14. **界面完全还原**：根据我提供的 12 个设计参考 HTML 页面，一比一复刻原站的布局、颜色、字体、间距、圆角、阴影及所有交互组件

**风格特征**：先给结论，再分步解释，友好、耐心、结构化，绝不编造。

---

## 二、界面设计参考（必须严格遵守）

我已将需要还原的网站页面**手动保存为完整的静态 HTML 文件**，并放置在了项目的 `design-reference/` 目录下。这些文件就是你用于设计还原的**唯一蓝图**。

### 参考文件列表及对应功能模块

| 文件名 | 对应功能模块 | 关键提取内容 |
| :--- | :--- | :--- |
| `LearnKata chat.html` | **主聊天界面** | 整体布局（侧边栏、聊天区、输入框）、对话气泡样式、字体、配色、图标风格 |
| `LearnKata chat mode=cards.html` | **闪卡学习模式界面** | 闪卡组件的具体样式、翻面效果、进度指示器布局 |
| `LearnKata chat mode=notes.html` | **笔记学习模式界面** | 笔记列表、富文本/结构化笔记的展示样式 |
| `LearnKata chat mode=quiz.html` | **测验模式界面** | 测验卡片的布局、选项按钮样式、正确错误反馈样式 |
| `LearnKata chats history.html` | **聊天历史侧边栏** | 历史对话列表的条目样式、搜索框、分组/日期标识 |
| `LearnKata settings tab=profile.html` | **设置 – 个人资料** | 设置页面的表单布局、输入框、头像上传区域样式 |
| `LearnKata settings tab=plan.html` | **设置 – 套餐计划** | 定价卡片、当前套餐高亮、功能列表对比样式 |
| `LearnKata_settings_tab=integrations.html` | **设置 – 集成** | 功能开关、第三方服务连接的卡片列表样式 |
| `LearnKata sources.html` | **知识库/资料源管理** | 文件列表、上传卡片、来源标签样式 |
| `LearnKata_spaces.html` | **学习空间管理** | 空间卡片网格布局、创建按钮、空间描述样式 |
| `LearnKata_new-space_modal.html` | **“新建空间”弹窗** | 模态框的遮罩、居中卡片、表单字段布局、按钮组 |
| `LearnKata_settings_modal.html` | **设置快捷弹窗** | 模态框的另一种尺寸/内容布局，体现弹出交互的统一风格 |

### 设计要求（AI 必须严格执行）

1.  **全局样式提取**：通读所有 `design-reference/` 下的 HTML 文件，提取出网站的设计语言：
    -   **主色调**：亮色/暗色模式？主背景、侧边栏背景、卡片背景的十六进制颜色。
    -   **排版**：标题、正文、辅助文本的字体大小、行高、字重。字体栈是什么（如 `Inter`, `system-ui`）？
    -   **间距**：元素之间的 padding、margin 规律（例如卡片内边距统一为 `24px`）。
    -   **圆角与阴影**：卡片、按钮、输入框的 `border-radius` 和 `box-shadow` 值。
    -   **边框**：分割线、输入框边框的颜色、粗细。
2.  **组件结构抽取**：分析每个 HTML 的 DOM 层级，识别出可复用的 React 组件。例如：
    -   从 `LearnKata chat.html` 中抽取出 `Sidebar`, `ChatArea`, `MessageBubble`, `ChatInput`。
    -   从 `LearnKata chats history.html` 中抽取出 `HistoryList`, `HistoryItem`。
    -   从两个 modal 文件中抽取出统一的 `<Modal>` 容器组件，然后用 `NewSpaceModal` 和 `SettingsModal` 分别实现内部内容。
3.  **样式实现规则**：
    -   **完全使用 Tailwind CSS** 实现所有样式。优先复用 `design-reference` HTML 中已有的 Tailwind 类名（如果存在）。如果不是 Tailwind 类名，则**根据颜色、尺寸等视觉特征，手动映射为 Tailwind 类名**（例如看到 `font-size: 16px` 映射为 `text-base`，`border-radius: 8px` 映射为 `rounded-lg`）。
    -   凡是参考页面中出现的图标，统一使用 `lucide-react` 图标库寻找最相近的图标进行替换。
    -   忽略所有原站点的 JavaScript 动效脚本（如菜单展开动画），所有交互逻辑（打开/关闭弹窗、切换选项、发送消息）**必须用 React useState/useEffect 完全重写**。
4.  **响应式与空状态处理**：参考页面可能只展示了桌面端布局，请同时考虑移动端的收缩菜单（汉堡菜单）。文件中未展示的空状态（如无历史记录、无空间），请自行设计合理且美观的“空状态”占位符。

---

## 三、技术栈（必须严格遵守）

-   **框架**：Next.js 14 App Router
-   **语言**：TypeScript
-   **AI SDK**：Vercel AI SDK (`ai` + `@ai-sdk/openai`)，使用 `streamText`
-   **模型**：OpenAI gpt-4o（可替换兼容接口）
-   **样式**：Tailwind CSS
-   **图标**：`lucide-react`
-   **Markdown 渲染**：`react-markdown` + `remark-math` + `rehype-katex` + `rehype-highlight`
-   **代码高亮**：`react-syntax-highlighter`
-   **Mermaid**：`mermaid` + 动态渲染组件
-   **RAG 向量检索**：简化实现用 `ai` 的 `embed` + 内存向量搜索，或可选 `@vercel/postgres` + `pgvector`；先用内存实现，文件分块用 `langchain/text_splitter`（或自己实现简单的分割）。为了方便，也可使用 `ai` 的 `retrieve` 工具，但这里使用手动构建上下文。
-   **数据库（可选但推荐）**：用于记忆存储，先用内存 Map 模拟，后期可换 `@vercel/kv` 或 Prisma + SQLite。
-   **对话记忆**：通过 `ai` 的 `CoreMessage` 数组管理，后端保存最近 20 轮。

---

## 四、项目文件结构

```
ai-tutor/
├── design-reference/                 # 👈 界面设计蓝图，不可删除
│   ├── LearnKata chat.html
│   ├── LearnKata chat mode=cards.html
│   ├── LearnKata chat mode=notes.html
│   ├── LearnKata chat mode=quiz.html
│   ├── LearnKata chats history.html
│   ├── LearnKata settings tab=profile.html
│   ├── LearnKata settings tab=plan.html
│   ├── LearnKata_settings_tab=integrations.html
│   ├── LearnKata sources.html
│   ├── LearnKata_spaces.html
│   ├── LearnKata_new-space_modal.html
│   └── LearnKata_settings_modal.html
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts              
│   │   ├── quiz/
│   │   │   └── route.ts              
│   │   ├── flashcard/
│   │   │   └── route.ts              
│   │   ├── rag/
│   │   │   ├── upload/route.ts       
│   │   │   └── query/route.ts        
│   │   └── memory/
│   │       └── route.ts              
│   ├── layout.tsx
│   ├── page.tsx                      
│   └── globals.css
├── components/
│   ├── layout/                       # 布局组件
│   │   ├── Sidebar.tsx               # 侧边栏（基于 LearnKata chat.html）
│   │   ├── Header.tsx                # 顶栏（如果需要）
│   │   └── MobileNav.tsx             # 移动端导航
│   ├── chat/                         # 聊天核心组件
│   │   ├── ChatArea.tsx              # 聊天消息列表（基于 LearnKata chat.html）
│   │   ├── ChatInput.tsx             # 输入框 + 模式选择 + 发送（同上）
│   │   └── MessageBubble.tsx         # 单条消息渲染（Markdown/LaTeX/代码/Mermaid）（同上）
│   ├── modes/                        # 各学习模式组件
│   │   ├── ModeSelector.tsx          # 模式下拉或按钮组
│   │   ├── QuizRenderer.tsx          # 渲染测验 JSON（基于 LearnKata chat mode=quiz.html）
│   │   └── FlashcardRenderer.tsx     # 闪卡翻卡组件（基于 LearnKata chat mode=cards.html）
│   ├── history/                      # 历史记录
│   │   └── HistoryList.tsx           # 历史对话列表（基于 LearnKata chats history.html）
│   ├── spaces/                       # 空间管理
│   │   ├── SpacesList.tsx            # 空间网格列表（基于 LearnKata_spaces.html）
│   │   └── NewSpaceModal.tsx         # 新建空间弹窗（基于 LearnKata_new-space_modal.html）
│   ├── settings/                     # 设置面板
│   │   ├── SettingsModal.tsx         # 设置弹窗/抽屉（基于 LearnKata_settings_modal.html）
│   │   └── SettingsPanel.tsx         # 具体设置内容（基于 LearnKata settings *.html）
│   ├── sources/                      # 资料源
│   │   └── FileUploader.tsx          # RAG 用文件上传（基于 LearnKata sources.html）
│   └── ui/                           # 通用 UI 基础组件
│       ├── Modal.tsx                 # 通用弹窗容器（抽取两个 modal 文件的共同骨架）
│       ├── Button.tsx
│       └── Card.tsx
├── lib/
│   ├── prompts.ts                    
│   ├── rag.ts                        
│   ├── memory.ts                     
│   └── utils.ts                      
├── public/
├── .env.local                        
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
└── package.json
```

---

## 五、核心文件详细设计与代码

请逐个文件生成完整代码，确保可以直接运行。下面给出每个文件的详细规范和必须包含的逻辑。

### 1. `.env.local`
```
OPENAI_API_KEY=sk-xxxx
```

### 2. `package.json` 依赖
```json
{
  "dependencies": {
    "next": "14.x",
    "react": "^18",
    "react-dom": "^18",
    "ai": "latest",
    "@ai-sdk/openai": "latest",
    "tailwindcss": "latest",
    "react-markdown": "latest",
    "remark-math": "latest",
    "rehype-katex": "latest",
    "rehype-highlight": "latest",
    "react-syntax-highlighter": "latest",
    "@types/react-syntax-highlighter": "latest",
    "mermaid": "latest",
    "katex": "latest",
    "lucide-react": "latest",
    "langchain/text_splitter": "latest" 
  },
  "devDependencies": {
    "@types/node": "latest",
    "typescript": "latest"
  }
}
```
(如果 langchain 太重，可自己实现一个简单的递归字符分割器，放在 `lib/rag.ts`)

### 3. `lib/prompts.ts` —— 融合三者精华的最终版

**必须精确输出以下代码**（这是核心）：

```ts
// lib/prompts.ts

export type ChatMode =
  | "chat"
  | "teach"
  | "code"
  | "file_qa"
  | "summary"
  | "rewrite"
  | "translate"
  | "quiz"
  | "flashcard";

// ========== 主系统提示词（融合了第二份的架构 + 第一份的教学规则） ==========
export const MASTER_SYSTEM_PROMPT = `
你是一个本地部署的中文 AI 学习助手，目标是帮助用户高质量地理解、分析、总结和完成任务。

你的整体风格必须接近一个优秀的教学型助手：
- 清晰、稳定、有条理
- 友好但不过度聊天
- 先解决用户最关心的问题，再补充必要背景，再给例子或步骤

总原则：
1. 默认使用简体中文回答，除非用户要求其他语言
2. 回答要准确、清晰、结构化
3. 信息不足时，先提问澄清，不要盲猜
4. 不确定时明确说明不确定，不要编造
5. 尽量先给结论，再给步骤、解释和示例
6. 复杂问题要拆成小步骤
7. 使用 Markdown 输出，方便阅读
8. 内容要简洁，但不能漏掉关键点
9. 尽量帮助用户真正理解，而不是只给答案
10. 如果用户表示不理解，**必须换一种更简单、更具体的说法**，禁止重复相同解释

教学风格强化：
当用户要求解释概念时，严格遵循这个顺序：
1. 一句话定义
2. 一个生活类比
3. 一个具体例子
4. 关键组成部分拆解
5. 常见误区提醒
6. 简短总结

表达风格要求：
- 语气自然、耐心、专业
- 不要写空话套话
- 优先使用小标题、列表、步骤
- 必要时用表格对比
- 必要时用类比帮助理解

交互策略：
- 用户问题模糊时，提出1-3个关键澄清问题
- 用户想要直接结果，就直接给结果
- 用户要求详细解释，就逐层展开
- 用户要求简短，就精炼回答
- 用户在学习，补充易错点和常见误区

可靠性要求：
- 不要假装看到不存在的信息
- 不要伪造引用
- 上下文不足时先说明限制，再给可行方案
- 有多答案时说明最推荐的那一个

默认回答结构建议：
1. 直接结论
2. 关键解释
3. 分步骤说明
4. 示例
5. 常见误区
6. 简短总结
`;

// ========== 专用模式提示词 ==========
export const CHAT_SYSTEM_PROMPT = `
你是一个通用中文聊天助手。
要求：
- 先回答用户最关心的问题
- 语言自然、清晰、直接
- 回答结构化，优先使用列表和小标题
- 如果问题需要推理，分步骤解释
- 如果问题模糊，先确认再继续
- 不要输出与问题无关的长篇内容
`;

export const TEACHING_SYSTEM_PROMPT = `
你现在处于“教学讲解模式”。
要求严格遵循以下顺序解释问题：
1. 先说明这件事为什么重要
2. 再用简单语言给出定义
3. 再给一个具体例子
4. 再拆解成关键步骤
5. 最后总结重点

- 用清晰、耐心、循序渐进的方式解释
- 先从具体例子讲起，再抽象到原理
- 适当使用类比帮助理解
- 避免一上来就堆术语
- 如果用户没懂，换一种更简单的说法重新解释
- 补充常见误区
`;

export const CODE_SYSTEM_PROMPT = `
你是一个专业编程助手。
要求：
1. 先给最小可运行版本
2. 再解释关键逻辑
3. 再给可选优化建议
4. 代码尽量可直接复制运行
5. 如果用户未指定技术栈，优先使用 Next.js + TypeScript
6. 如果存在多种实现方案，优先给最简单可靠的一种
7. 代码回答要包含必要的文件结构、依赖和运行步骤
8. 如果用户问的是报错，优先定位原因，再给修复方法

输出结构：问题结论 -> 解决方案 -> 代码 -> 解释 -> 注意事项
`;

export const FILE_QA_SYSTEM_PROMPT = `
你是一个文件问答助手。
规则：
1. 只能基于提供的文件内容回答
2. 如果文件中没有相关信息，明确说“文件中未找到相关信息”
3. 不要猜测、不要扩展编造
4. 回答时尽量引用文件中的关键内容进行概括
5. 如果文件内容不足以回答，说明缺少哪些信息
6. 保持简洁、准确、结构化
`;

export const SUMMARY_SYSTEM_PROMPT = `
你现在处于“总结模式”：
- 提炼最重要的信息
- 去掉重复和冗余
- 按层级组织内容
- 输出清晰、简洁、结构化
- 如果内容很长，优先保留结论、定义、步骤、结论和例子
`;

export const REWRITE_SYSTEM_PROMPT = `
你是一个文本润色助手。
要求：
1. 保留原意
2. 改得更清晰、更自然
3. 不要增加无关信息
4. 如果用户要求正式/口语/简洁风格，要严格遵守
5. 如果用户没有指定风格，默认使用自然、通顺、专业的表达
`;

export const TRANSLATE_SYSTEM_PROMPT = `
你是一个翻译助手。
要求：
1. 准确翻译
2. 保留原文含义
3. 根据目标语言习惯调整表达，使其自然
4. 不要额外解释，除非用户要求
5. 如果原文有术语、缩写或专有名词，尽量保持一致
`;

// ========== 教学专用模式（融合第一份高仿版） ==========
export const QUIZ_SYSTEM_PROMPT = `
你现在处于“出题模式”：
- 根据给定内容生成题目
- 覆盖核心知识点
- 难度适中
- 题型可包含选择题、判断题、简答题
- 每题必须包含标准答案和简短解析
- 输出严格 JSON 格式，方便前端渲染
`;

export const FLASHCARD_SYSTEM_PROMPT = `
你现在处于“闪卡模式”：
- 每张卡只聚焦一个知识点
- 正面简短（问题或提示），背面准确（答案）
- 语言要适合记忆
- 输出严格 JSON 格式
`;

// 通用 JSON 输出约束（与上述教学模式搭配）
export const JSON_OUTPUT_PROMPT = `
你必须只输出合法 JSON。
不要使用 Markdown 代码块。
不要输出任何解释性文字。
字段名必须固定，若无法完成则返回错误 JSON（如 { "error": "原因" }）。
`;

// ========== 模式拼接映射表 ==========
export const MODES: Record<ChatMode, string> = {
  chat: `${MASTER_SYSTEM_PROMPT}\n\n${CHAT_SYSTEM_PROMPT}`,
  teach: `${MASTER_SYSTEM_PROMPT}\n\n${TEACHING_SYSTEM_PROMPT}`,
  code: `${MASTER_SYSTEM_PROMPT}\n\n${CODE_SYSTEM_PROMPT}`,
  file_qa: `${MASTER_SYSTEM_PROMPT}\n\n${FILE_QA_SYSTEM_PROMPT}`,
  summary: `${MASTER_SYSTEM_PROMPT}\n\n${SUMMARY_SYSTEM_PROMPT}`,
  rewrite: `${MASTER_SYSTEM_PROMPT}\n\n${REWRITE_SYSTEM_PROMPT}`,
  translate: `${MASTER_SYSTEM_PROMPT}\n\n${TRANSLATE_SYSTEM_PROMPT}`,
  quiz: `${MASTER_SYSTEM_PROMPT}\n\n${QUIZ_SYSTEM_PROMPT}\n\n${JSON_OUTPUT_PROMPT}`,
  flashcard: `${MASTER_SYSTEM_PROMPT}\n\n${FLASHCARD_SYSTEM_PROMPT}\n\n${JSON_OUTPUT_PROMPT}`,
};

// 获取系统提示词的工厂函数
export function getSystemPrompt(mode: ChatMode = "chat"): string {
  return MODES[mode] || MODES.chat;
}

// ========== 构建带上下文的 prompt（RAG、总结等） ==========
export function buildFileQaPrompt(context: string, question: string): string {
  return `
你将基于以下资料回答问题。

【资料】
${context}

【问题】
${question}

要求：
1. 只能基于资料回答
2. 如果资料中没有答案，明确说“文件中未找到相关信息”
3. 不要猜测
4. 回答要简洁准确
`;
}

export function buildSummaryPrompt(text: string): string {
  return `请总结以下内容。\n【内容】\n${text}\n\n要求：\n- 提炼核心信息\n- 去掉重复内容\n- 输出层级清晰\n- 保持简洁`;
}

export function buildRewritePrompt(text: string, style?: string): string {
  return `请润色下面这段文字。\n【原文】\n${text}\n【风格要求】\n${style ?? "自然、通顺、专业"}\n\n要求：保留原意，更清晰自然，不增加无关信息。`;
}

export function buildTranslatePrompt(text: string, targetLanguage: string = "中文"): string {
  return `请将下面内容翻译成 ${targetLanguage}。\n【原文】\n${text}\n\n要求：准确、原意、自然表达，不要额外解释。`;
}
```

---

### 4. `lib/rag.ts` —— 简单的本地 RAG 实现

实现分块、存储和检索，用内存模拟向量搜索（此处为了可用性，使用 OpenAI embeddings + 简单的余弦相似度）。  
代码包含以下函数：

- `splitTextIntoChunks(text: string): string[]` 使用递归字符分割器（可手写一个简单版本，按段落和句子长度切分，最大 500 字符，重叠 100）
- `embedChunks(chunks: string[]): Promise<number[][]>` 调用 OpenAI `embedding` API
- `searchRelevantChunks(query: string, chunks: string[], embeddings: number[][]): Promise<string[]>` 对查询进行嵌入，计算余弦相似度，返回 top 3 相似度最高的文本拼接成上下文。

（请生成详细代码，包含错误处理、环境变量读取）

### 5. `lib/memory.ts` —— 对话记忆管理

导出：

```ts
let conversationHistory: CoreMessage[] = [];

export function addMessage(message: CoreMessage) { ... }
export function getRecentMessages(): CoreMessage[] { return conversationHistory.slice(-20); }
export function clearMemory() { conversationHistory = []; }
```

### 6. API 路由：`app/api/chat/route.ts`

这是最核心的通用聊天接口，接收 `POST` 请求：

- 请求体：`{ messages: { role, content }[], mode?: ChatMode }`
- 从中提取用户消息，调用 `addMessage` 保存。
- 根据 `mode` 获取系统 prompt（通过 `getSystemPrompt(mode)`）
- 使用 `ai` 的 `streamText`：
  ```ts
  import { streamText } from 'ai';
  import { openai } from '@ai-sdk/openai';
  import { getSystemPrompt } from '@/lib/prompts';
  import { getRecentMessages, addMessage } from '@/lib/memory';
  
  export async function POST(req: Request) {
    const { messages, mode = 'chat' } = await req.json();
    // 将用户消息存入记忆
    for (const msg of messages) {
      addMessage(msg);
    }
    const system = getSystemPrompt(mode);
    const result = await streamText({
      model: openai('gpt-4o'),
      system,
      messages: getRecentMessages(),
      temperature: 0.2,
    });
    return result.toDataStreamResponse();
  }
  ```
（处理最后助手消息也需保存，通过监听流完成或前端再调用一次记忆保存接口？简单做法：流式返回，由前端在收到完整回复后调用 `/api/memory` 保存助手消息。这里也可以后端在 `streamText` 后处理 `onFinish`，但 `streamText` 异步。更简单：前端维护消息列表，每次请求带上完整历史，后端不保持长期记忆，只通过 `messages` 参数传递。但要求对话记忆，所以采用后端存储，路由只需读取 `getRecentMessages()` 即可，而 `addMessage` 应该在请求前和流结束后分别调用。直接在路由中：先添加用户消息，然后获取历史，流式响应。助手消息的保存可以在前端拿到完整文本后发送 POST 到 `/api/memory` 保存。可以使用 `ai` 的 `onFinish` 回调在 `streamText` 中保存助手响应到记忆。具体实现：在 `streamText` 的 `onFinish` 参数中调用 `addMessage({ role: 'assistant', content: text })`。该回调在流结束后触发，可以拿到完整文本。这是最佳实践。请按照此方式实现。

### 7. `app/api/quiz/route.ts`

接收 POST，主体包含 `content`（要出题的材料）和可选的题目数量。  
使用 `getSystemPrompt('quiz')` 或直接拼接 `QUIZ_SYSTEM_PROMPT + JSON_OUTPUT_PROMPT`，然后调用 `streamText` 或 `generateText`（因为不需要流式，直接返回 JSON），使用 `generateText` 更加合适。返回 JSON 响应。

要求输出格式示例：

```json
{
  "questions": [
    {
      "type": "multiple-choice",
      "question": "...",
      "options": ["A","B","C","D"],
      "answer": "A",
      "explanation": "..."
    }
  ]
}
```

前端渲染需要解析 JSON。必须让 AI 严格输出 JSON，温度设低（0 或 0.1）。

### 8. `app/api/flashcard/route.ts`

类似 quiz，接收 `content`，使用 `getSystemPrompt('flashcard')`，调用 `generateText` 返回 JSON。

输出格式：
```json
{
  "cards": [
    { "front": "什么是光合作用？", "back": "植物利用光能合成有机物" }
  ]
}
```

### 9. `app/api/rag/upload/route.ts`

处理文件上传（支持 txt, md, pdf? 先只支持文本）。读取内容，调用 `splitTextIntoChunks` 分块，然后 `embedChunks` 得到嵌入向量。存入内存 Map（`fileId -> { chunks, embeddings }`），返回 `fileId`。实际生产用矢量数据库，这里保持简单。

### 10. `app/api/rag/query/route.ts`

接收 `{ fileId, question }`，取出对应文件的 chunks 和 embeddings，使用 `searchRelevantChunks` 检索到上下文，然后构造 `buildFileQaPrompt(context, question)`，用 `getSystemPrompt('file_qa')` 或直接使用 `FILE_QA_SYSTEM_PROMPT` + `MASTER_SYSTEM_PROMPT`，调用 `streamText` 流式返回。

### 11. `app/api/memory/route.ts`

简单的 REST 接口：
- `POST` 添加记忆（{ role, content }）
- `GET` 获取记忆（用于调试）
- `DELETE` 清空

前端在每次助手完成回答后调用 POST 保存助手消息。

---

## 六、前端核心组件

### 1. `app/page.tsx` 主页面

包含布局：左侧模式选择区（或顶部导航），右侧聊天区。使用 state 管理：
- `mode: ChatMode`
- `messages: { role, content }[]`
- 输入框和发送逻辑

当发送消息时，调用 `/api/chat` 使用 `fetch` 和 `readableStream` 处理流式增量更新。可使用 Vercel AI SDK 的 `useChat` hook，它会自动处理流和状态。但为了自定义，可使用 `useChat` from `ai/react`。

推荐使用 `useChat`，非常方便：
```tsx
import { useChat } from 'ai/react';

export default function Page() {
  const [mode, setMode] = useState<ChatMode>('chat');
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: { mode },
  });

  return (
    <div className="flex flex-col h-screen">
      <ModeSelector value={mode} onChange={setMode} />
      <ChatArea messages={messages} />
      <ChatInput input={input} onChange={handleInputChange} onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
```

需要在 `useChat` 中传递 `body`，当 mode 改变时，需重新初始化或动态传递。可使用 `useChat` 的 `body` 选项为一个对象引用，组件更新时 `body` 会变。或使用 `useChat` 的 `sendMessage` 配合自定义请求。简单处理：mode 作为 state，在 `useChat` 初始化时将 mode 加入依赖并 key 变化重新挂载？不如使用稳定的 API，每次发送时在请求体中带上最新的 mode。`useChat` 支持 `body` 属性，可以传入一个对象，它会发送到服务器。但这个对象在组件重新渲染时不会自动更新？实际上 `useChat` 的配置项在初始化后固定。我们需要在每次提交时能够传递当前 mode。可以通过重写 `handleSubmit`，手动构建请求体调用 `fetch` 和 `ai` 的流处理。但为了代码简洁，可以使用 `useChat` 的 `onRequest` 回调来修改请求体？查阅文档：`useChat` 的 `body` 可以是一个对象，也可以是一个函数返回对象，但模式变化后需要能够响应。我们采用自定义 hook 或手动实现流式。下面提供手动实现方案以确保绝对可控。

更好的方案：编写自定义的 `useCustomChat` hook，使用 `fetch` 和 ReadableStream 处理，这样我们能轻松控制 body 参数。这个 hook 需要管理 messages，处理增量更新。不过这样会比较复杂。作为给 AI 的提示词，可以要求生成一个自定义的 `useChat` 实现，但为了快速，我们可以借助 `ai` 的 `useChat` 但用 key 强制重新创建。简单方法：在 mode 变化时，给组件 Key 或者重新初始化。另一种方式：使用 `useChat` 的 `sendMessage` 并覆写 `api` 和 `body`。实际上 `useChat` 返回的 `sendMessage` 可以带第二个参数 `options`，其中 `options.body` 可以动态指定。我们可以利用它。例如：

```tsx
const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
  api: '/api/chat',
  body: { mode },
  onResponse(response) { ... }
});
```

但 `body` 若在 `useChat` 配置中指定，会作为请求体的一部分发送，且 `body` 可以是函数 `() => ({ mode })`。文档：`body?: Record<string, any> | () => Record<string, any>` 可以接受一个函数，每次请求时调用。那么我们可以这样：

```tsx
const { ... } = useChat({
  api: '/api/chat',
  body: () => ({ mode }),
});
```

这样 mode 更新后，请求会携带最新的 mode。这很完美。因此前端仍可使用 `useChat`。

### 2. `ModeSelector` 组件

显示按钮或下拉：聊天、讲解、代码、总结、出题、闪卡、润色、翻译、文件问答等。切换时更新 mode state。

### 3. `ChatArea` 组件

渲染消息列表，每条消息使用 `MessageBubble`。必须支持滚动到底部。

### 4. `MessageBubble` 组件

根据 role 应用不同样式。支持 Markdown 渲染，集成 KaTeX 和代码高亮。需要引入相关依赖并使用 ReactMarkdown 组件，配置 remarkMath 和 rehypeKatex，并且处理代码块。同时支持 Mermaid 图表：检测代码块语言为 mermaid，使用 `mermaid.render` 动态渲染为 SVG。可以使用 `useEffect` 和 `dangerouslySetInnerHTML`。实现细节可写。

### 5. `QuizRenderer` 与 `FlashcardRenderer`

这两个组件分别用于解析 JSON 并渲染测验界面和闪卡翻转效果。出题和闪卡模式后端直接返回 JSON，前端需要识别这些消息并渲染特殊组件。可以在聊天消息中检测是否是助手返回的结构化数据，试图解析 JSON。为了方便，我们可以让出题和闪卡有独立的页面或弹窗，但融入聊天流更自然。方案：在 `MessageBubble` 中，如果检测到消息内容看起来是 JSON（比如以 `{` 开头）且 mode 是 quiz 或 flashcard，就尝试解析并渲染交互组件，否则正常显示 Markdown。但注意 stream 时内容不完整，无法解析。因此可以在流结束后在 `onFinish` 回调中将解析后的结构化数据存入 message 的一个额外字段（如 `structuredData`）。`useChat` 的 `messages` 不可直接扩展。另一种办法：专门为 quiz/flashcard 使用单独的 API，不在聊天流混合，但这不符合统一的聊天体验。我们可以：当用户在聊天中输入“用出题模式”并发送，实际上会发送给 `/api/chat` 并设置 mode=quiz，但后端 `streamText` 仍然流式返回文本，前端不实时解析，最终渲染时检测到 code block 为 json 并尝试渲染？不太可靠。更稳健的设计：quiz 和 flashcard 模式单独使用一个非流式接口 `/api/quiz`，前端渲染在聊天界面外部，或者嵌入一个特殊卡片。但是为了方便，我们可以让这些模式也流式输出，但要求 AI 将 JSON 包裹在代码块中，前端通过 `onFinish` 或手动解析最后一条消息的代码块。AI 输出严格 JSON 提示词是为了确保可解析。我们可以在前端 `useEffect` 中，当消息列表最后一条是助手且未处理时，尝试用正则提取代码块中的 JSON，解析后替换为组件。但流式过程中消息会更新很多次，最好在流完全结束后处理。可以利用 `useChat` 的 `onFinish` 回调来获取最终消息，并解析 JSON，存储到自定义 state 中，然后渲染对应的卡片。但是，如果我们在 `onFinish` 里得到了完整文本，可以将其存入一个额外的数组 `structuredMessages`，同时不显示原始文本。这需要管理复杂状态。简单权衡：对于 quiz 和 flashcard，建议在前端做一个独立的“生成器”面板，不经过聊天流。但既然要做全局聊天，我们可以接受：如果用户选择了 quiz 模式，则自动将聊天接口指向 `/api/quiz`，该接口返回 JSON，然后前端用 `fetch` 获取并在聊天下方显示测验卡片。同时仍然把问题和答案作为普通消息记录。为了降低复杂度，在实现中，当 mode 为 quiz 或 flashcard 时，前端调用专门 API 并展示组件，聊天消息仍保留用户的提问和助手的“已生成题目”文本。这在提示词里要明确写清楚。

我决定在提示词里要求：对于 quiz 和 flashcard 功能，前端在检测到 mode 为此类时，额外调用 `/api/quiz` 或 `/api/flashcard` 接口，传入最近的用户输入内容，然后将返回的 JSON 渲染在聊天区域下方或替代最后一条助手消息。但为避免混乱，可以让用户的提问消息正常显示，而助手的回答由一个自定义组件接管，该组件从 state 中获取数据。需实现 `useChat` 的 `onFinish` 逻辑，如果 mode='quiz'，在 `onFinish` 后调用 `/api/quiz` 获取结构化数据并存入 state。这里设计为：用户发送“请根据以下内容出题...”时，客户端检测到 mode=quiz，在发送之前先提取用户内容，同时调用 `/api/chat` 生成题目文本（可选）或直接调用 `/api/quiz` 并显示。为简单，直接在发送消息时，如果是 quiz 模式，就使用 `/api/quiz` 替代 `/api/chat`，并读取响应 JSON 渲染。这种情况下不使用 `useChat` 的统一流，而是手动 fetch。我们可以在 `onSubmit` 时判断 mode，分支处理。这并不难，所以提示词会描述这种逻辑。

### 6. `FileUploader` 组件

用于文件问答功能。提供一个上传按钮，选择文件后调用 `/api/rag/upload`，获取 `fileId`。然后提问时，带上 `fileId` 和问题，调用 `/api/rag/query`。可以在聊天界面中增加一个“上传文件”按钮，上传后记录 fileId，然后输入相关问题，前端检测到已上传文件，就调用 rag query 接口而非普通 chat。同样可切换 mode 为 `file_qa`，并将 fileId 作为 body 传递。后端 `/api/chat` 可以扩展支持 `fileId`，内部调用 RAG 逻辑。这样更统一。但初始设计保持独立路由也可以。为了一致性，我们修改 `/api/chat`，当 mode='file_qa' 时，要求 body 中包含 `fileId` 和 `question` 等，内部实现 RAG。可以，但考虑到 quiz/flashcard 等都需要独立处理，我们把 file_qa 也纳入统一聊天路由：在 `/api/chat` 中，如果 mode 是 file_qa，则从请求中获取 `fileId` 和 `question`（从 messages 提取最后一条用户消息作为问题），然后检索，构建 prompt，流式返回。这需要在路由里引入 `rag.ts`。我们可以这样实现。那么前端只需在切换模式为文件问答后，聊天请求自然携带 mode='file_qa'，后端根据 mode 执行不同逻辑。完美。

因此在 `/api/chat/route.ts` 中增加逻辑：

```ts
if (mode === 'file_qa') {
  const question = lastUserMessage;
  const fileId = body.fileId; // 来自请求体额外字段
  if (!fileId) throw new Error('缺少 fileId');
  const context = await getRelevantContext(fileId, question);
  const prompt = buildFileQaPrompt(context, question);
  // 调用 streamText 使用 system prompt 和 prompt 作为用户消息？可以直接将构建的 prompt 作为最后一条消息内容传递给模型。
  const result = await streamText({
    model: openai('gpt-4o'),
    system: MODES.file_qa,
    messages: [...previousMessages, { role: 'user', content: prompt }],
    temperature: 0.2,
  });
  return result.toDataStreamResponse();
}
```

这样前端只需保证发送 `{ messages, mode, fileId }` 即可。使用 `useChat` 的 `body` 函数可包含 fileId state。

同样 quiz 和 flashcard 模式，也可以考虑在 `/api/chat` 中处理：当 mode 为 quiz，提取用户消息里可能包含的材料，拼接 `QUIZ_PROMPT`，并用 `generateText` 返回 JSON。但流式聊天和 JSON 输出不太兼容。所以 quiz/flashcard 建议保持独立路由，前端在 mode 为此类时，不走 `useChat`，而使用一个独立的函数 `generateQuiz(content)` 调用 `/api/quiz`。这时用户界面可以设计为：输入框中输入需要出题的材料，然后点击发送，前端不再将这条消息作为对话，而是直接调用 quiz API 并显示结果，同时不记录到聊天历史。或者记录到历史，但助手回复会是一条特殊的标记。简单起见，前端可在模式为 quiz 时，在输入框旁边增加“生成题目”按钮，点击时，取输入内容，调用 `/api/quiz`，将返回的题目数组渲染在下方卡片中，不经过聊天流。这样更清晰。同样闪卡。

因此，整体前端处理：
- 普通模式（chat/teach/code/summary/rewrite/translate）：使用 `useChat` hook 连接 `/api/chat`
- file_qa 模式：也使用 `useChat`，但需要在`body`中传递 `fileId`，并先完成文件上传
- quiz / flashcard：不使用聊天流，有独立的生成器 UI，调用独立 API

这部分在组件中实现。

---

## 七、前端组件详细要求

### `ModeSelector`
- 显示所有模式的中文名，如“聊天”、“教学讲解”、“代码辅助”、“文件问答”、“总结”、“润色”、“翻译”、“出题”、“闪卡”
- 当前激活模式高亮
- 选择时调用 `onChange`

### `ChatArea` 与 `MessageBubble`
- 支持显示用户和 AI 头像
- AI 消息使用 `react-markdown` 渲染，插件需正确配置：`remarkMath`, `rehypeKatex`, `rehypeHighlight`，并处理 `code` 组件，如果是 mermaid 则渲染为图表。
- 数学公式：行内 `$...$`，块级 `$$...$$` 需支持
- 代码块：使用 `react-syntax-highlighter` 包裹，支持语言标签
- Mermaid：检测到语言 `mermaid`，用 `mermaid.render` 生成 svg，注意每次渲染唯一 id，避免冲突。

### `QuizRenderer`
- 接收 questions 数组，逐题显示
- 选择题可点击选项，显示对错，展示解析
- 判断题可切换
- 简答题可展开答案

### `FlashcardRenderer`
- 显示卡片列表，点击翻面
- 支持键盘翻页

### `FileUploader`
- 文件选择后自动上传，显示上传状态，返回 fileId 存入 state
- 在 file_qa 模式下，提问时会带上 fileId

---

## 八、后端实现补充细节

### `/api/chat/route.ts` 完整逻辑
- 获取 `messages`, `mode`, `fileId`（可选）
- 如果 mode 是 `quiz` 或 `flashcard`，不应走此接口（前端不会调用），但为了容错，可返回错误。
- 使用 `getSystemPrompt(mode)`
- 如果 mode 是 `file_qa`，按上述 RAG 分支处理。
- 其他 mode 直接使用 `streamText`，`temperature: 0.2`
- 记忆管理：在 `streamText` 的 `onFinish` 回调中，将助手消息 `{ role: 'assistant', content: text }` 调用 `addMessage` 存入内存。在请求开始，先调用 `addMessage` 存储用户消息（如果 messages 最后一条是 user 且未存储）。由于 messages 是从前端传过来的完整历史，需要避免重复存储。最好是直接信任前端传来的 messages 数组作为历史，后端不再单独维护记忆，而是接收 messages 并原样传递给模型，同时也可以缓存到内存供后续使用（可选）。但为了支持跨会话记忆（如偏好），可使用全局内存存储最近消息。实现：每次请求，将传来的最新一轮用户消息和即将生成的助手消息存入 `conversationHistory`，而传递给模型的 messages 参数可直接使用 `getRecentMessages()` 拼接？但前端传来的 messages 已经是历史对话，如果同时依赖后端记忆，会造成混乱。权衡之下，放弃后端记忆，完全依赖前端维护消息列表。这样更简单，且无状态。那么 `lib/memory.ts` 可不需要。如果用户想要长期记忆，可用 `onFinish` 将对话存入 KV 存储，但暂时可以不实现。对话记忆通过前端 `useChat` 维护的消息列表并每次全量发送，这已经覆盖了上下文。所以我们实际上不需要后端记忆，只需前端传递足够长的消息历史。因此可以删除 `lib/memory.ts` 和 `/api/memory` 路由。这简化了架构。在提示词中说明：使用无状态设计，前端发送完整对话历史，上下文长度由 token 限制决定。

### 因此，修改路由：直接接收 `messages` 和 `mode`，无需记忆保存。流式返回。

---

## 九、最终调整后的完整文件要求

在生成项目代码时，请严格遵循上述所有细节，并输出可直接运行的文件。特别关注：

- `lib/prompts.ts` 必须使用我提供的完整版本。
- `lib/rag.ts` 包含内存向量存储，实现简单文本分块和检索，依赖环境变量 `OPENAI_API_KEY`。
- API 路由要处理错误，返回合适的 HTTP 状态码。
- 前端组件要健壮，处理加载和错误状态。
- 样式美观，使用 Tailwind CSS，主色调柔和学术风格。
- **最重要的是**：所有组件的视觉设计必须严格参照 `design-reference/` 中的相关 HTML 文件。AI 在编写每一个组件之前，应该先读取对应的设计参考文件，分析其 DOM 结构和 CSS 样式，然后用 Tailwind 进行精确还原。对于模态框、侧边栏等复杂组件，必须做到像素级还原。

---

## 十、启动与配置

1. 安装依赖：`npm install`
2. 创建 `.env.local`，填入密钥
3. `npm run dev`

---

**现在，请根据以上所有信息，生成完整的项目代码。要求每个文件都给出完整内容，不要省略。最后总结出项目结构和关键使用说明。**