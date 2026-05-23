# plan.md

---

## 2026-05-19 Sprint 7A — 资料来源与引用系统 MVP

### 本轮用户目标

将 RAG 从"只返回回答"升级为"可追溯来源的资料问答"。实现 SourceDocument/SourceChunk/Citation 类型、PDF 上传、citations 返回、前端引用卡片和资料阅读器侧边面板。

### 已完成

- [x] `lib/types.ts`：新增 SourceDocument、SourceChunk、Citation 类型；ChatMessage 增加可选 citations 字段。
- [x] `lib/rag.ts`：ChunkRecord 增加 chunkIndex/locator；FileRecord 增加 mimeType/createdAt；getRelevantContext 返回 citations 数组；新增 MIN_RELEVANCE_SCORE 阈值（0.05）；新增 addPdfPagesToStore、listSourceDocuments、getSourceDocument、getSourceChunks。
- [x] `app/api/rag/upload/route.ts`：支持 PDF 上传（pdf-parse v1.1.1），按页提取文本；返回 SourceDocument；GET 返回 SourceDocument 列表。
- [x] `app/api/rag/query/route.ts`：改为返回 JSON `{answer, citations}`；低于阈值时返回"资料不足"。
- [x] `app/api/rag/source/route.ts`：新增 GET 接口，支持 sourceId + chunkIndex 查询，返回 document、focusChunk、nearbyChunks。
- [x] `app/api/chat/route.ts`：file_qa 分支改为返回 JSON `{answer, citations}`；增加 MIN_RELEVANCE_SCORE 检查。
- [x] `components/chat/MessageBubble.tsx`：渲染引用卡片列表（编号、fileName、locator、excerpt、score）；支持 onCitationClick。
- [x] `components/chat/ChatArea.tsx`：传递 onCitationClick 给 MessageBubble。
- [x] `components/sources/SourceReader.tsx`：新建右侧侧边面板，显示命中片段和上下文片段；支持"用此片段提问/生成笔记/生成测验"操作。
- [x] `components/sources/FileUploader.tsx`：accept 增加 .pdf。
- [x] `app/page.tsx`：file_qa 响应改为解析 JSON；集成 SourceReader 侧边面板和引用点击。

### 改动文件

| 文件 | 改动 |
|------|------|
| lib/types.ts | 新增 SourceDocument、SourceChunk、Citation；ChatMessage 增加 citations |
| lib/rag.ts | 重构 chunk/file 数据结构；新增 source 查询函数；MIN_RELEVANCE_SCORE |
| app/api/rag/upload/route.ts | PDF 支持；返回 SourceDocument |
| app/api/rag/query/route.ts | JSON 响应；citations |
| app/api/rag/source/route.ts | 新建 |
| app/api/chat/route.ts | file_qa JSON 响应；citations |
| components/chat/MessageBubble.tsx | 引用卡片渲染 |
| components/chat/ChatArea.tsx | onCitationClick |
| components/sources/SourceReader.tsx | 新建 |
| components/sources/FileUploader.tsx | PDF accept |
| app/page.tsx | citations 处理；SourceReader 集成 |
| package.json | +pdf-parse@1.1.1, +@types/pdf-parse |

### 验证结果

- [x] `npm run typecheck` 通过。
- [x] `npm run build` 通过，新增 /api/rag/source 路由。
- [ ] 未做端到端手动上传/查询验证（需启动 dev server 后人工验证）。
- [ ] 未验证 PDF 上传实际效果（需准备测试 PDF 文件）。

### 未完成风险

- file_qa 从流式改为 JSON 非流式，用户感知延迟可能增加（文件问答通常较短，可接受）。
- pdf-parse 的 pagerender 是未文档化的内部 API，部分 PDF 可能不支持按页提取，会退化为全文单 chunk。
- 内存存储仍无持久化，服务重启后数据丢失。
- 词频向量精度有限，引用相关性可能不准。

### 下一步

1. 启动 dev server，手动验证：上传 txt/md → query 返回 citations → 聊天 file_qa 显示引用卡片 → 点击引用打开 SourceReader。
2. 准备测试 PDF 文件验证 PDF 上传和按页提取。
3. 后续 Sprint：持久化空间/历史/资料索引；笔记/测验/闪卡从引用片段生成；mindmap；学习计划。

---

## 2026-05-11 可运行性验证与 LearnKata 学习功能差距

### 本轮用户目标

验证项目当前是否可运行；对照原始 LearnKata 网站与 `design-reference/` 快照，梳理仍缺失的主要学习功能，并按 `CLAUDE.md` 要求更新计划。

### 验证结论

- [x] `npm.cmd run typecheck` 通过。
- [x] `npm.cmd run build` 通过，Next.js 14 生产构建成功，包含首页与 5 个 API 路由。
- [x] `npm.cmd run start -- -p 3000` 可启动，`http://localhost:3000` 返回 200。
- [x] `/api/chat` 在无 AI Key 时返回本地兜底回答，可用于基础流程验证。
- [x] `/api/quiz` 与 `/api/flashcard` 返回结构化 JSON，本地兜底模式可跑通测验/闪卡流程。
- [x] `/api/rag/upload` 使用 `multipart/form-data` 上传文本文件通过，随后 `/api/rag/query` 可基于上传资料返回本地资料答案。
- [ ] 未完成浏览器像素级桌面/移动端截图检查；当前仅验证了 HTTP 与 API 行为。
- [ ] 未使用真实外部 AI Key 验证云端模型、流式质量与文件问答端到端效果。

### 已实现但仍是初版的学习能力

- 聊天/讲解/总结/润色/翻译/代码辅助等模式已有 prompt 与聊天入口。
- 测验和闪卡已有独立 API、前端交互组件与无 Key 兜底数据。
- 资料源已有 txt/md/csv 上传、内存索引、简单相似度检索和文件问答。
- 笔记模式已有结构化展示，但主要基于输入文本在前端切分，不是原站级别的资料理解与笔记生成。
- 空间、历史、设置已有页面/弹窗级 UI，但多数数据仍停留在前端内存或 localStorage。

### 对照原始 LearnKata 缺失的主要学习功能

1. **多类型学习资料导入**
   - 原站入口强调上传 PDF/音频、录制讲座、导入链接/YouTube/网站、粘贴文本，并在设置中展示 Canvas、Google Classroom、Google Drive、Notion、Blackboard 等学习平台集成。
   - 当前仅支持 txt/md/csv 文本文件上传；录音、音频转写、PDF 解析、网页/YouTube 抓取、LMS/云盘导入均未实现。

2. **来源级阅读器与可追溯引用**
   - 原站产品说明强调回答可回到具体来源与页码；设计快照包含文件查看器相关资源。
   - 当前 RAG 只保存文本 chunk，不保存页码、时间戳、来源位置、原文高亮或可点击引用；也没有真正的 PDF/文档阅读器。

3. **结构化笔记自动生成**
   - 原站核心卖点之一是把学习材料转成结构化笔记。
   - 当前 `NotesPanel` 是前端按行切分输入并生成简化重点/下一步，没有基于完整资料、章节层级、引用和 AI 摘要的笔记生成链路。

4. **个性化学习计划 / Roadmap**
   - 原站公开介绍包含学习计划与 roadmap 类能力。
   - 当前只有“空间”和 checklist，没有根据资料、目标、截止日期、掌握度生成学习路线、每日任务或复习计划。

5. **视觉化 Mindmap / 概念图**
   - 原站公开介绍包含可视化 mindmap；快照中也加载了 Mermaid/flowDiagram 相关资源。
   - 当前仅支持聊天消息中渲染 Mermaid，没有从资料自动生成可编辑/可展开的概念图、知识图谱或章节关系图。

6. **学习进度、掌握度与复习调度**
   - 原站定位是学习型 AI tutor，预期应追踪练习表现与复习节奏。
   - 当前测验/闪卡结果不持久化，不统计正确率、薄弱知识点、掌握度、错题本、间隔重复或复习提醒。

7. **持久化学习空间、历史和资料库**
   - 原站侧边栏的 Spaces / Chats / Sources 是核心信息架构。
   - 当前空间、历史、资料源基本是单会话内存状态；服务重启或刷新后大量学习数据会丢失，无法跨空间组织资料、对话和学习成果。

8. **真实集成与协作闭环**
   - 原站设置中有外部学习平台集成和订阅计划信息。
   - 当前设置主要是本地 AI provider 配置；Canvas/Google Classroom/Drive/Notion/Blackboard 等集成只是参考层面的缺口，尚未有 OAuth、同步、权限或导入流程。

### 新增阶段 7：补齐核心学习闭环

状态：待实施

任务：
- [ ] 资料导入升级：先实现 PDF 文本解析与来源元数据，再扩展网页链接/粘贴文本；音频/YouTube/LMS 集成放后续阶段。
- [ ] 为 RAG chunk 增加 `sourceId`、`page`/`locator`、`excerpt`、`score`，文件问答返回可点击引用列表。
- [ ] 实现资料阅读器：显示原始文本/PDF 页、命中片段、高亮和“用此片段提问/生成笔记/生成测验”操作。
- [ ] 实现基于来源的结构化笔记生成：章节提纲、关键概念、例子、易错点、引用来源、可继续生成测验/闪卡。
- [ ] 实现学习计划 MVP：用户输入目标/日期/资料，生成 roadmap、每日任务、复习建议，并可在空间中保存。
- [ ] 实现 mindmap MVP：从笔记或资料生成 Mermaid/树图数据，支持节点展开、重新生成和跳回来源。
- [ ] 持久化空间/历史/资料索引/测验结果：优先使用本地 JSON/IndexedDB 或轻量数据库，明确迁移路径。
- [ ] 增加学习进度：记录测验正确率、闪卡翻面/掌握状态、错题与薄弱点，驱动复习建议。

验收标准：
- 用户可上传至少一种真实课程文件（优先 PDF），在阅读器中查看内容，并对具体片段提问。
- 文件问答答案必须带来源引用；资料不足时明确说明。
- 用户可从同一份资料生成笔记、测验、闪卡和 mindmap，并把结果保存到空间。
- 关闭页面或重启服务后，空间、资料、历史和学习结果仍可恢复。
- `typecheck`、`build` 通过；关键学习链路有最小 API/组件验证。

### 当前风险

- `plan.md` 与 `history.md` 历史内容存在明显编码损坏，本轮仅追加 UTF-8 新段落，未重写旧内容。
- 真实 LearnKata 站点可能需要登录才能完整观察内部学习流程；本轮对照基于公开首页、当前快照和已保存设计资源。
- 当前生产服务由本轮启动在 3000 端口，用于人工继续检查；如端口占用需先停止对应 Node/Next 进程。

---

## 2026-05-05 前端批注修正进展

### 本轮用户目标

根据浏览器批注继续修正 LearnKata 首页体验：侧边栏在当前桌面宽度下应显示并可折叠/打开；顶部需要补回设置入口；欢迎语中的用户名不应写死，应可点击修改；入门 checklist 不应占据欢迎区主体，应移动到输入框下方页面底部，并提供隐藏/展开按钮。同时确认核心功能连接状态。

### 已完成

- [x] 首页侧栏从 `lg` 断点调整为 `md` 断点，在约 933-994px 宽度的桌面视口也会显示。
- [x] 侧栏顶部 `PanelLeft` 图标可隐藏侧栏；聊天顶部补充侧栏开关，折叠后可重新打开。
- [x] 聊天顶部右侧补回设置按钮，并保持聊天记录、新建对话、打开文件查看器入口。
- [x] 欢迎语用户名改为可点击编辑，编辑值写入 `localStorage` 的 `learnkata-username`，侧栏用户信息同步展示。
- [x] 入门 checklist 从欢迎区移到输入框下方，默认折叠为“显示入门步骤”，展开后展示创建空间、上传笔记、打开来源三个动作。
- [x] 快捷 prompt 按钮已连接到模式和输入框：解释、测验、卡片、笔记会预填对应任务。
- [x] 来源、空间、设置、历史、新建对话等入口均指向现有页面状态或弹窗。

### 验证结果

- `npm.cmd run typecheck` 通过。
- `npm.cmd run build` 通过。
- `Invoke-WebRequest http://localhost:3000` 可返回页面，并确认 HTML 中包含 `显示入门步骤`、`设置`、`新建对话`、`欢迎回来`、`点击修改用户名` 等关键文案。

### 剩余风险与下一步

- 外部 AI API 真实调用依赖用户填写 API Key、Base URL 和模型名；当前已验证前端配置和路由连接，未使用真实第三方密钥做端到端云端请求。
- 浏览器自动化插件本轮未暴露 Node REPL 控制工具，无法直接用插件截图回归；已用构建和本地 HTTP 页面内容做替代验证。
- 下一步建议在浏览器中手动验证：折叠/打开侧栏、点击用户名编辑、展开入门步骤、进入设置页填写 DeepSeek 或硅基流动配置后发起一次真实聊天。

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
