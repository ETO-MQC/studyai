"use client";

import { useEffect, useState } from "react";
import { ChatArea } from "@/components/chat/ChatArea";
import { ChatInput } from "@/components/chat/ChatInput";
import { MobileNav } from "@/components/layout/MobileNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { FlashcardRenderer } from "@/components/modes/FlashcardRenderer";
import { NotesPanel } from "@/components/modes/NotesPanel";
import { QuizRenderer } from "@/components/modes/QuizRenderer";
import { FileUploader } from "@/components/sources/FileUploader";
import { NewSpaceModal } from "@/components/spaces/NewSpaceModal";
import { SpacesList } from "@/components/spaces/SpacesList";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { Modal } from "@/components/ui/Modal";
import { AI_CONFIG_STORAGE_KEY, DEFAULT_AI_CONFIG, normalizeAiConfig, type AiRuntimeConfig } from "@/lib/ai-config";
import type {
  ChatMessage,
  ChatMode,
  FlashcardPayload,
  QuizPayload,
  SourceFile,
  Space
} from "@/lib/types";
import { newId } from "@/lib/utils";

const initialSpaces: Space[] = [
  {
    id: "space_math",
    name: "数学复习",
    description: "整理概念讲解、公式推导和错题复盘。",
    color: "#4f6df5"
  },
  {
    id: "space_code",
    name: "编程练习",
    description: "保存代码问题、示例和调试笔记。",
    color: "#10b981"
  }
];

async function readTextStream(response: Response, onChunk: (chunk: string) => void) {
  if (!response.body) {
    onChunk(await response.text());
    return;
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value, { stream: true }));
  }
}

export default function Page() {
  const [mode, setMode] = useState<ChatMode>("chat");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFile, setActiveFile] = useState<SourceFile | null>(null);
  const [quiz, setQuiz] = useState<QuizPayload | null>(null);
  const [flashcards, setFlashcards] = useState<FlashcardPayload | null>(null);
  const [notesSource, setNotesSource] = useState("");
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [spacesOpen, setSpacesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newSpaceOpen, setNewSpaceOpen] = useState(false);
  const [spaces, setSpaces] = useState<Space[]>(initialSpaces);
  const [aiConfig, setAiConfig] = useState<AiRuntimeConfig>(DEFAULT_AI_CONFIG);

  useEffect(() => {
    function readConfig() {
      try {
        const raw = window.localStorage.getItem(AI_CONFIG_STORAGE_KEY);
        setAiConfig(normalizeAiConfig(raw ? JSON.parse(raw) : DEFAULT_AI_CONFIG));
      } catch {
        setAiConfig(DEFAULT_AI_CONFIG);
      }
    }

    function handleConfigChanged(event: Event) {
      const detail = (event as CustomEvent<Partial<AiRuntimeConfig>>).detail;
      setAiConfig(normalizeAiConfig(detail));
    }

    readConfig();
    window.addEventListener("learnkata-ai-config-changed", handleConfigChanged);
    window.addEventListener("storage", readConfig);
    return () => {
      window.removeEventListener("learnkata-ai-config-changed", handleConfigChanged);
      window.removeEventListener("storage", readConfig);
    };
  }, []);

  function resetModeArtifacts() {
    setQuiz(null);
    setFlashcards(null);
  }

  async function submit() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setLoading(true);
    resetModeArtifacts();

    if (mode === "quiz") {
      await generateQuiz(text);
      setLoading(false);
      return;
    }

    if (mode === "flashcard") {
      await generateFlashcards(text);
      setLoading(false);
      return;
    }

    if (mode === "notes") {
      setNotesSource(text);
      setMessages((prev) => [
        ...prev,
        { id: newId("msg"), role: "user", content: text },
        {
          id: newId("msg"),
          role: "assistant",
          content: "已整理为结构化笔记。你可以继续追问，或切换到出题/闪卡进行复习。"
        }
      ]);
      setLoading(false);
      return;
    }

    const userMessage: ChatMessage = { id: newId("msg"), role: "user", content: text };
    const assistantId = newId("msg");
    const assistantMessage: ChatMessage = { id: assistantId, role: "assistant", content: "" };
    const nextMessages = [...messages, userMessage, assistantMessage];
    setMessages(nextMessages);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          fileId: activeFile?.fileId,
          aiConfig,
          messages: [...messages, userMessage].map(({ role, content }) => ({ role, content }))
        })
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || "请求失败");
      }
      await readTextStream(response, (chunk) => {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantId ? { ...message, content: message.content + chunk } : message
          )
        );
      });
    } catch (error) {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                content: `请求失败：${error instanceof Error ? error.message : "未知错误"}`
              }
            : message
        )
      );
    } finally {
      setLoading(false);
    }
  }

  async function generateQuiz(content: string) {
    const userMessage: ChatMessage = { id: newId("msg"), role: "user", content };
    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: newId("msg"), role: "assistant", content: "已根据材料生成测验。请在右侧学习面板中作答。" }
    ]);
    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, count: 5, aiConfig })
      });
      const data = (await response.json()) as QuizPayload & { error?: string };
      if (!response.ok) throw new Error(data.error || "生成测验失败");
      setQuiz(data);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: newId("msg"),
          role: "assistant",
          content: `生成测验失败：${error instanceof Error ? error.message : "未知错误"}`
        }
      ]);
    }
  }

  async function generateFlashcards(content: string) {
    const userMessage: ChatMessage = { id: newId("msg"), role: "user", content };
    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: newId("msg"), role: "assistant", content: "已根据材料生成复习闪卡。点击卡片可以翻面。" }
    ]);
    try {
      const response = await fetch("/api/flashcard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, count: 8, aiConfig })
      });
      const data = (await response.json()) as FlashcardPayload & { error?: string };
      if (!response.ok) throw new Error(data.error || "生成闪卡失败");
      setFlashcards(data);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: newId("msg"),
          role: "assistant",
          content: `生成闪卡失败：${error instanceof Error ? error.message : "未知错误"}`
        }
      ]);
    }
  }

  const hasStudyPanel = quiz || flashcards || notesSource;

  return (
    <main className="flex h-screen overflow-hidden bg-canvas">
      <Sidebar
        messages={messages}
        onNewChat={() => {
          setMessages([]);
          setQuiz(null);
          setFlashcards(null);
          setNotesSource("");
        }}
        onOpenSources={() => setSourcesOpen(true)}
        onOpenSpaces={() => setSpacesOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <section className="flex min-w-0 flex-1 flex-col">
        <MobileNav
          onOpenSources={() => setSourcesOpen(true)}
          onOpenSpaces={() => setSpacesOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
        />
        <div className="flex min-h-0 flex-1">
          <div className="min-w-0 flex-1">
            <ChatArea messages={messages} />
          </div>
          {hasStudyPanel && (
            <aside className="hidden w-[420px] shrink-0 overflow-y-auto border-l border-line bg-sidebar p-4 xl:block">
              <div className="mb-3">
                <p className="text-xs font-medium uppercase text-neutral-500">Study Panel</p>
                <h2 className="text-lg font-semibold text-neutral-950">学习结果</h2>
              </div>
              <QuizRenderer payload={quiz} />
              <FlashcardRenderer payload={flashcards} />
              {notesSource && <NotesPanel source={notesSource} />}
            </aside>
          )}
        </div>
        <ChatInput
          mode={mode}
          value={input}
          loading={loading}
          fileName={activeFile?.name}
          onModeChange={setMode}
          onChange={setInput}
          onSubmit={submit}
          onOpenSources={() => setSourcesOpen(true)}
        />
      </section>

      <Modal open={sourcesOpen} title="资料源" onClose={() => setSourcesOpen(false)}>
        <FileUploader activeFile={activeFile} onUploaded={setActiveFile} />
      </Modal>

      <Modal open={spacesOpen} title="学习空间" onClose={() => setSpacesOpen(false)}>
        <SpacesList spaces={spaces} onCreate={() => setNewSpaceOpen(true)} />
      </Modal>

      <NewSpaceModal
        open={newSpaceOpen}
        onClose={() => setNewSpaceOpen(false)}
        onCreate={(space) => setSpaces((prev) => [space, ...prev])}
      />

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </main>
  );
}
