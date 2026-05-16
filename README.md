<div align="center">

<img src="public/LearnKataMascot.png" alt="LearnKata Mascot" width="120" />

# LearnKata — AI-Powered Learning Companion

**Your personal AI tutor that turns any material into an interactive learning experience.**

Chat with your study materials, generate quizzes & flashcards, take structured notes, and track your learning progress — all in one place.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](#)

</div>

---

## Why LearnKata?

Most AI chat tools give you a blank text box. LearnKata gives you a **learning workspace** — upload your materials, ask questions grounded in your sources, and let the AI guide you through understanding, practice, and review.

> **Stop re-reading. Start learning by doing.**

---

## Features

### Conversational Learning
- **Multi-mode chat** — switch between Tutor (Socratic explanation), Quiz, Flashcards, and Notes on the fly
- **Source-grounded answers** — AI responses are based on your uploaded documents, not hallucinated facts
- **Rich rendering** — full Markdown, LaTeX math formulas, syntax-highlighted code blocks, and Mermaid diagrams

### Study Tools
- **Auto-generated quizzes** — multiple choice, true/false, short answer, and fill-in-the-blank from your materials
- **Spaced flashcards** — AI extracts key concepts and creates review-ready cards
- **Structured notes** — generate clean, organized notes from conversations or source documents

### Knowledge Management
- **Source library** — upload and manage documents (PDF, TXT, DOCX, Markdown) as your personal knowledge base
- **Learning spaces** — organize materials into subject-specific workspaces
- **Chat history** — full conversation history with search and continuation

### Personalization
- **Custom settings** — adjust AI behavior, language preferences, and learning profile
- **Local-first fallback** — works without an API key using built-in demo responses for UI exploration
- **Responsive design** — seamless experience on desktop and mobile

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| AI Integration | OpenAI-compatible API |
| RAG Pipeline | Custom document retrieval & context injection |
| Math Rendering | KaTeX + remark-math + rehype-katex |
| Diagrams | Mermaid.js |
| Code Highlighting | react-syntax-highlighter + rehype-highlight |
| Icons | Lucide React |

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/ETO-MQC/studyai.git
cd ai-tutor
npm install
```

### 2. Configure (Optional)

For real AI capabilities, create `.env.local`:

```bash
OPENAI_API_KEY=sk-your-key
```

> Without an API key, the app runs with local fallback responses — perfect for exploring the UI and development.

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
ai-tutor/
├── app/
│   ├── api/
│   │   ├── chat/          # Chat completion endpoint
│   │   ├── flashcard/     # Flashcard generation
│   │   ├── quiz/          # Quiz generation
│   │   └── rag/           # Document upload & retrieval
│   ├── page.tsx           # Main application entry
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── chat/              # Chat interface & message rendering
│   ├── modes/             # Tutor / Quiz / Cards / Notes modes
│   ├── sources/           # Document library & upload
│   ├── spaces/            # Learning space management
│   ├── history/           # Conversation history
│   ├── settings/          # User preferences
│   ├── layout/            # Sidebar, header, navigation
│   └── ui/                # Shared UI primitives
├── lib/
│   ├── ai-client.ts       # AI API client with fallback
│   ├── prompts.ts         # System & mode-specific prompts
│   ├── rag.ts             # RAG pipeline logic
│   └── types.ts           # Shared TypeScript types
├── design-reference/      # LearnKata design snapshots
└── public/                # Static assets
```

---

## How It Works

```
 Upload Materials           Ask Questions            Learn & Review
 +-----------------+       +-----------------+      +-----------------+
 | Drag & drop     |  -->  | AI reads your   | -->  | Quiz yourself   |
 | PDF, DOCX, TXT  |       | sources & chats |      | Review cards    |
 | Markdown files  |       | like a tutor    |      | Export notes    |
 +-----------------+       +-----------------+      +-----------------+
```

1. **Import** — Upload your study materials to build a personal knowledge base
2. **Chat** — Ask questions; AI answers based on your documents with citations
3. **Practice** — Generate quizzes and flashcards from any conversation or document
4. **Organize** — Create learning spaces, take notes, track your progress

---

## For Contributors & AI Agents

This project is built with AI-agent collaboration in mind. Before contributing:

- Read [`CLAUDE.md`](CLAUDE.md) — development rules and agent guidelines
- Read [`plan.md`](plan.md) — current project status and next steps
- Read [`history.md`](history.md) — recent decisions and context

---

## License

MIT

---

<div align="center">

**Built for learners who want to learn smarter, not harder.**

</div>
