<div align="center">

<img src="public/LearnKataMascot.png" alt="LearnKata mascot" width="128" />

# LearnKata

AI 驱动的个人学习工作台。把课程资料、对话辅导、测验、闪卡、笔记和学习进度放到同一个界面里，帮助学习者从“看资料”转向“主动练习”。

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)

</div>

## 项目简介

LearnKata 是一个基于 Next.js App Router 构建的 AI 学习助手。项目围绕“学习空间”组织资料和对话，支持上传学习材料、基于材料提问、生成测验与闪卡、整理结构化笔记，并提供历史会话、来源库和个性化设置。

当前版本已经包含完整的前端体验、OpenAI 兼容接口调用、RAG 上传与查询接口，以及无 API Key 时的本地 fallback 逻辑，适合继续扩展为个人知识库、课程复习工具或 AI 教学产品原型。

## 核心功能

| 模块 | 能力 |
| --- | --- |
| AI 对话学习 | Tutor、Quiz、Flashcards、Notes 多模式切换，支持 Markdown、数学公式、代码高亮和 Mermaid 图表渲染 |
| 资料库 | 上传 PDF、TXT、DOCX、Markdown 等学习材料，作为后续问答和练习生成的上下文来源 |
| RAG 问答 | 通过 `app/api/rag` 上传、检索和读取资料，让回答尽量贴近用户材料 |
| 测验生成 | 根据资料或会话生成选择题、判断题、简答题和填空题 |
| 闪卡复习 | 自动抽取关键概念，生成适合复习的卡片 |
| 学习空间 | 按课程、考试或主题管理资料和对话 |
| 历史记录 | 保留会话上下文，方便继续学习和回顾 |
| 设置面板 | 管理学习偏好、AI 行为和界面选项 |

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 应用框架 | Next.js 14, React 18 |
| 开发语言 | TypeScript |
| 样式系统 | Tailwind CSS |
| AI 接入 | OpenAI-compatible API |
| 资料处理 | `pdf-parse`, 自定义 RAG pipeline |
| 富文本渲染 | `react-markdown`, `remark-math`, `rehype-katex`, `rehype-highlight` |
| 图表与图示 | Mermaid |
| 图标 | Lucide React |

## 快速开始

```bash
git clone https://github.com/ETO-MQC/studyai.git
cd studyai
npm install
npm run dev
```

启动后访问：

```text
http://localhost:3000
```

如需启用真实 AI 能力，在项目根目录创建 `.env.local`：

```bash
OPENAI_API_KEY=sk-your-api-key
```

未配置 API Key 时，项目仍会使用本地 fallback 响应，方便预览界面和开发流程。

## 常用命令

```bash
npm run dev        # 启动本地开发服务
npm run build      # 生产构建
npm run start      # 启动生产服务
npm run lint       # Next.js lint
npm run typecheck  # TypeScript 类型检查
```

## 项目结构

```text
ai-tutor/
├─ app/
│  ├─ api/
│  │  ├─ chat/        # AI 对话接口
│  │  ├─ flashcard/   # 闪卡生成接口
│  │  ├─ quiz/        # 测验生成接口
│  │  └─ rag/         # 资料上传、查询和读取
│  ├─ page.tsx        # 应用主入口
│  └─ globals.css     # 全局样式
├─ components/
│  ├─ chat/           # 对话区与消息渲染
│  ├─ history/        # 会话历史
│  ├─ layout/         # 侧边栏、移动导航
│  ├─ modes/          # Tutor / Quiz / Cards / Notes / Mindmap
│  ├─ settings/       # 设置面板
│  ├─ sources/        # 资料上传与阅读
│  ├─ spaces/         # 学习空间
│  └─ ui/             # 通用 UI 组件
├─ lib/
│  ├─ ai-client.ts    # AI 客户端与 fallback
│  ├─ prompts.ts      # 系统提示词与模式提示词
│  ├─ rag.ts          # RAG 处理逻辑
│  └─ types.ts        # 共享类型
├─ public/            # 静态资源
└─ design-reference/  # 设计参考页面与截图资源
```

## 使用流程

1. 创建学习空间，按课程、考试或主题组织材料。
2. 上传 PDF、文档或 Markdown 资料。
3. 在 Tutor 模式中基于资料提问，获得解释、例子和追问。
4. 切换到 Quiz 或 Flashcards 模式，把材料转成练习。
5. 用 Notes 模式沉淀结构化笔记，并通过历史记录继续会话。

## 开发说明

- `CLAUDE.md` 记录了项目协作和实现约束。
- `plan.md` 记录当前阶段计划和后续任务。
- `history.md` 记录近期实现过程与决策背景。

## 适合继续扩展的方向

- 接入向量数据库或本地 embedding 缓存，增强 RAG 检索质量。
- 为测验和闪卡增加错题记录、掌握度和间隔复习。
- 增加导出能力，例如 Markdown、PDF、Anki 卡片包。
- 接入 LearnKata 以外的学习平台或资料同步入口。

## License

MIT
