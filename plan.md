# plan.md

本文件用于记录 AI Tutor / LearnKata 项目的开发计划、进度、验收标准、风险与下一步。所有 AI 智能体开始开发前必须先阅读 `CLAUDE.md`、`plan.md`、`history.md`，并在完成实质性工作后同步更新本文件。

---

## 项目目标

基于 `beginprompt.md` 与 `design-reference/` 中的 LearnKata 静态页面，开发一个本地优先、中文教学导向的 AI 学习助手。产品需要支持聊天学习、教学讲解、内容总结、出题、闪卡、代码辅助、资料问答、润色、翻译、对话上下文、流式输出、LaTeX、Mermaid、学习空间、资料源管理、历史记录与设置等功能。

---

## AI 开发必须遵循的规则

- 必须遵守 `CLAUDE.md` 中的所有规则。
- 开始任务前先读：`CLAUDE.md`、`plan.md`、`history.md`、相关代码和对应设计参考。
- 只做与当前任务直接相关的改动，避免无关重构。
- 每次实质性开发、修复、设计调整、架构决策或验证后更新 `plan.md`。
- 每次任务交付或对话结束时更新 `history.md`。
- 修改 UI 前必须查看对应的 `design-reference/` HTML，提取布局、颜色、间距、字体、圆角、阴影和交互状态。
- 验证失败或无法验证时，必须记录原因、命令和下一步建议。

---

## 技术基线

- 框架：Next.js 14 App Router
- 语言：TypeScript
- 样式：Tailwind CSS
- AI SDK：Vercel AI SDK (`ai` + `@ai-sdk/openai`)
- 默认模型：OpenAI `gpt-4o`，接口需便于替换
- Markdown：`react-markdown` + `remark-math` + `rehype-katex` + `rehype-highlight`
- 代码高亮：`react-syntax-highlighter`
- 图表：`mermaid`
- 图标：`lucide-react`
- RAG：优先本地内存版文本分块、embedding、相似度检索；后续可迁移数据库

---

## 设计参考映射

| 参考文件 | 目标模块 | 当前状态 |
|---|---|---|
| `design-reference/LearnKata_chat.html` | 主聊天界面、侧边栏、消息区、输入框 | 第一轮已实现 |
| `design-reference/LearnKata_chat_mode=cards.html` | 闪卡学习模式 | 第一轮已实现 |
| `design-reference/LearnKata_chat_mode=notes.html` | 笔记学习模式 | 第一轮已实现 |
| `design-reference/LearnKata_chat_mode=quiz.html` | 测验模式 | 第一轮已实现 |
| `design-reference/LearnKata_chats_history.html` | 历史记录 | 第一轮已实现 |
| `design-reference/LearnKata_settings_tab=profile.html` | 设置：个人资料 | 第一轮已实现 |
| `design-reference/LearnKata_settings_tab=plan.html` | 设置：套餐计划 | 第一轮已实现 |
| `design-reference/LearnKata_settings_tab=integrations.html` | 设置：集成 | 第一轮已实现 |
| `design-reference/LearnKata_sources.html` | 资料源管理 | 第一轮已实现 |
| `design-reference/LearnKata_spaces.html` | 学习空间 | 第一轮已实现 |
| `design-reference/LearnLata_new-space_modal.html` | 新建空间弹窗 | 第一轮已实现 |
| `design-reference/LearnLata_settings_modal.html` | 设置弹窗 | 第一轮已实现 |

注意：当前目录中 modal 文件名为 `LearnLata_*`，与 `beginprompt.md` 中的 `LearnKata_*` 拼写不一致。后续实现时应以实际文件名为准，不要擅自重命名，除非用户明确要求。

---

## 开发阶段

### 阶段 0：项目脚手架与规则落地

状态：第一轮完成，待依赖安装后验证

任务：
- [x] 基于 `beginprompt.md` 创建项目进度文档 `plan.md`
- [x] 创建对话交接文档 `history.md`
- [x] 优化 `CLAUDE.md` 中的智能体 prompt
- [x] 初始化 Next.js 14 + TypeScript + Tailwind 项目结构
- [x] 配置基础依赖、脚本、环境变量示例

验收标准：
- `CLAUDE.md`、`plan.md`、`history.md` 三个协作文档存在且内容一致。
- 新 AI 智能体能通过三份文档恢复项目目标、流程和下一步。

### 阶段 1：设计系统提取

状态：第一轮完成，待像素级细化

任务：
- [x] 通读 12 个设计参考 HTML
- [x] 提取颜色、字体、间距、圆角、阴影、边框、布局网格
- [x] 形成 Tailwind token 映射
- [x] 识别可复用组件：Sidebar、ChatArea、MessageBubble、ChatInput、Modal、Card、Button、Tabs、HistoryItem、FileItem、SpaceCard

验收标准：
- `app/globals.css`、`tailwind.config.ts` 或等价样式层能表达参考设计语言。
- 后续组件能复用统一样式，不靠临时硬编码堆叠。

### 阶段 2：核心聊天体验

状态：第一轮完成，待运行验证

任务：
- [x] 实现主布局：侧边栏、聊天区、输入区、模式选择
- [x] 实现 `lib/prompts.ts` 与模式映射
- [x] 实现 `/api/chat` 流式接口
- [x] 支持 Markdown、LaTeX、代码高亮、Mermaid
- [x] 实现普通聊天、教学讲解、总结、润色、翻译、代码辅助模式

验收标准：
- 本地启动后第一屏就是可用聊天体验。
- 模式切换能驱动不同 system prompt。
- AI 消息渲染稳定，长内容不溢出。

### 阶段 3：结构化学习模式

状态：第一轮完成，待运行验证

任务：
- [x] 实现 `/api/quiz` 与 `QuizRenderer`
- [x] 实现 `/api/flashcard` 与 `FlashcardRenderer`
- [x] 实现笔记模式 UI
- [x] 处理 JSON 解析失败、空内容、加载状态和重试

验收标准：
- 出题和闪卡输出严格 JSON，前端渲染为交互组件。
- 选择题、判断题、简答题有明确反馈和解析。
- 闪卡支持翻面与基础键盘操作。

### 阶段 4：资料源与 RAG

状态：第一轮完成，待运行验证

任务：
- [x] 实现资料上传 UI
- [x] 实现 `/api/rag/upload`
- [x] 实现 `lib/rag.ts` 文本分块、相似度检索
- [x] 实现 `/api/rag/query` 与 `/api/chat` 的 file_qa 分支
- [x] 处理缺少文件、空文件、检索不到答案等状态

验收标准：
- 用户能上传文本资料并基于资料问答。
- 文件问答必须明确基于资料回答，找不到时不编造。

### 阶段 5：学习空间、历史与设置

状态：第一轮完成，待运行验证

任务：
- [x] 实现学习空间列表与新建空间弹窗
- [x] 实现聊天历史列表与搜索/分组展示
- [x] 实现设置弹窗与 profile / plan / integrations 面板
- [x] 实现合理本地状态或简化持久化策略

验收标准：
- 页面结构与参考设计一致。
- 空状态、错误状态、移动端布局可用。

### 阶段 6：验证与收尾

状态：进行中，依赖安装受阻

任务：
- [ ] 运行类型检查、lint、构建或最小可行验证
- [ ] 检查桌面与移动端关键页面
- [x] 记录验证结果和剩余风险
- [x] 补充 README 或启动说明

验收标准：
- 项目可本地启动。
- 核心学习流程可走通。
- 未完成事项在 `plan.md` 与 `history.md` 中清楚记录。

---

## 当前风险

- `beginprompt.md` 的目标范围很大，需要分阶段实现，避免一次性生成过多不可维护代码。
- RAG、记忆、历史记录和学习空间是否需要持久化尚未定稿，初期建议本地内存或浏览器状态优先。
- 设计参考 modal 文件名存在 `LearnLata` 拼写差异，后续实现要按实际路径读取。
- 外部 AI 接口依赖 `OPENAI_API_KEY`，无密钥时只能验证 UI、类型和本地逻辑。
- `npm.cmd install` 首次失败：因沙箱无法写入 `C:\Users\mqcin\AppData\Local\npm-cache`，错误为 `EPERM`。
- `npm.cmd install --cache .\.npm-cache` 第二次超时，未生成 `node_modules` 或 `package-lock.json`。
- 使用提升权限重试 `npm.cmd install --cache .\.npm-cache` 时，自动权限审查超时，未执行完成。
- 本次安装超时产生 `.npm-cache/`，尝试删除时权限审查超时，暂留项目目录，后续可人工删除。

---

## 下一步

1. 解决 npm 依赖安装问题，优先运行 `npm.cmd install --cache .\.npm-cache` 或人工清理缓存后重试。
2. 依赖安装成功后运行 `npm run typecheck`、`npm run build`。
3. 根据构建结果修复类型或运行时问题。
4. 使用浏览器检查桌面与移动端关键页面，继续做像素级设计细化。
