# AI Tutor / LearnKata

本项目是基于 `beginprompt.md` 与 `design-reference/` 参考页面落地的本地优先中文 AI 学习助手。

## 功能

- 通用聊天、教学讲解、总结、代码辅助、润色、翻译
- 出题与闪卡生成
- 文本资料上传与文件问答
- 结构化笔记、学习空间、历史记录、设置面板
- Markdown、LaTeX、代码高亮、Mermaid 渲染
- 未配置 `OPENAI_API_KEY` 时提供本地兜底结果，方便验证 UI 与流程

## 启动

```bash
npm install
npm run dev
```

如需启用真实 AI 能力，复制 `.env.example` 为 `.env.local` 并填写：

```bash
OPENAI_API_KEY=sk-your-key
```

## AI 开发规则

后续 AI 智能体开始任务前必须阅读：

- `CLAUDE.md`
- `plan.md`
- `history.md`

完成实质性开发、修复、设计调整、架构决策或验证后，必须同步更新 `plan.md` 与 `history.md`。
