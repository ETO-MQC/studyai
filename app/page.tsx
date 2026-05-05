"use client";

import {
  ArrowRight,
  Blocks,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clipboard,
  ClipboardList,
  Database,
  FileText,
  Folder,
  FolderPlus,
  History,
  Layers,
  LifeBuoy,
  Link,
  MessageCircle,
  MessageSquare,
  Mic,
  MoreVertical,
  PanelLeft,
  Plus,
  Search,
  Settings,
  Sparkles,
  SquarePen,
  Upload,
  Zap
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { ChatArea } from "@/components/chat/ChatArea";
import { ChatInput } from "@/components/chat/ChatInput";
import { FlashcardRenderer } from "@/components/modes/FlashcardRenderer";
import { NotesPanel } from "@/components/modes/NotesPanel";
import { QuizRenderer } from "@/components/modes/QuizRenderer";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { FileUploader } from "@/components/sources/FileUploader";
import { NewSpaceModal } from "@/components/spaces/NewSpaceModal";
import { SpacesList } from "@/components/spaces/SpacesList";
import { Button } from "@/components/ui/Button";
import {
  AI_CONFIG_STORAGE_KEY,
  DEFAULT_AI_CONFIG,
  normalizeAiConfig,
  type AiRuntimeConfig
} from "@/lib/ai-config";
import type {
  ChatMessage,
  ChatMode,
  FlashcardPayload,
  QuizPayload,
  SourceFile,
  Space
} from "@/lib/types";
import { cn, newId } from "@/lib/utils";

type AppView = "chat" | "history" | "sources" | "spaces" | "settings";

const USERNAME_STORAGE_KEY = "learnkata-username";

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

const topModes: Array<{ mode: ChatMode; label: string; icon: LucideIcon }> = [
  { mode: "chat", label: "聊天", icon: MessageSquare },
  { mode: "quiz", label: "测验", icon: ClipboardList },
  { mode: "notes", label: "笔记", icon: FileText },
  { mode: "flashcard", label: "卡片", icon: Layers }
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
  const [view, setView] = useState<AppView>("chat");
  const [mode, setMode] = useState<ChatMode>("chat");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFile, setActiveFile] = useState<SourceFile | null>(null);
  const [sources, setSources] = useState<SourceFile[]>([]);
  const [quiz, setQuiz] = useState<QuizPayload | null>(null);
  const [flashcards, setFlashcards] = useState<FlashcardPayload | null>(null);
  const [notesSource, setNotesSource] = useState("");
  const [newSpaceOpen, setNewSpaceOpen] = useState(false);
  const [spaces, setSpaces] = useState<Space[]>(initialSpaces);
  const [aiConfig, setAiConfig] = useState<AiRuntimeConfig>(DEFAULT_AI_CONFIG);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [username, setUsername] = useState("mqcingetooo1");

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

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(USERNAME_STORAGE_KEY);
      if (saved?.trim()) setUsername(saved.trim());
    } catch {
      setUsername("mqcingetooo1");
    }
  }, []);

  function updateUsername(value: string) {
    const next = value.trim() || "学习者";
    setUsername(next);
    try {
      window.localStorage.setItem(USERNAME_STORAGE_KEY, next);
    } catch {
      // localStorage can be unavailable in private contexts; the in-memory value still works.
    }
  }

  function resetModeArtifacts() {
    setQuiz(null);
    setFlashcards(null);
  }

  function handleUploaded(file: SourceFile) {
    setActiveFile(file);
    setSources((prev) => [file, ...prev.filter((item) => item.fileId !== file.fileId)]);
    setView("chat");
    setMode("file_qa");
  }

  function newChat() {
    setMessages([]);
    setQuiz(null);
    setFlashcards(null);
    setNotesSource("");
    setView("chat");
    setMode("chat");
  }

  function usePrompt(nextMode: ChatMode, text: string) {
    setMode(nextMode);
    setInput(text);
  }

  async function submit() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setLoading(true);
    resetModeArtifacts();
    setView("chat");

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
          content: "已整理为结构化笔记。你可以继续追问，或切换到测验、卡片继续复习。"
        }
      ]);
      setLoading(false);
      return;
    }

    const userMessage: ChatMessage = { id: newId("msg"), role: "user", content: text };
    const assistantId = newId("msg");
    const assistantMessage: ChatMessage = { id: assistantId, role: "assistant", content: "" };
    setMessages((prev) => [...prev, userMessage, assistantMessage]);

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
      { id: newId("msg"), role: "assistant", content: "已根据材料生成测验，请在右侧学习面板中作答。" }
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
      { id: newId("msg"), role: "assistant", content: "已根据材料生成复习卡片，点击卡片可以翻面。" }
    ]);
    try {
      const response = await fetch("/api/flashcard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, count: 8, aiConfig })
      });
      const data = (await response.json()) as FlashcardPayload & { error?: string };
      if (!response.ok) throw new Error(data.error || "生成卡片失败");
      setFlashcards(data);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: newId("msg"),
          role: "assistant",
          content: `生成卡片失败：${error instanceof Error ? error.message : "未知错误"}`
        }
      ]);
    }
  }

  const hasStudyPanel = quiz || flashcards || notesSource;

  return (
    <main className="flex min-h-dvh w-full bg-background text-foreground">
      {sidebarOpen && (
        <Sidebar
          view={view}
          setView={setView}
          newChat={newChat}
          activeFile={activeFile}
          username={username}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      <section className="flex min-w-0 flex-1 flex-col">
        {view === "chat" && (
          <div className="flex min-h-0 flex-1">
            <div className="flex min-w-0 flex-1 flex-col">
              <ChatHeader
                mode={mode}
                onModeChange={setMode}
                setView={setView}
                newChat={newChat}
                sidebarOpen={sidebarOpen}
                onToggleSidebar={() => setSidebarOpen((open) => !open)}
              />
              <div className="lk-scrollbar min-h-0 flex-1 overflow-y-auto">
                {messages.length ? (
                  <ChatArea messages={messages} />
                ) : (
                  <EmptyChat
                    username={username}
                    onUsernameChange={updateUsername}
                    onOpenSources={() => setView("sources")}
                    onOpenSettings={() => setView("settings")}
                    onUsePrompt={usePrompt}
                  />
                )}
              </div>
              <div className="mx-auto w-full max-w-[840px] px-5 pb-8">
                <ChatInput
                  mode={mode}
                  value={input}
                  loading={loading}
                  fileName={activeFile?.name}
                  cloudFallback={aiConfig.cloudFallback}
                  onModeChange={setMode}
                  onChange={setInput}
                  onSubmit={submit}
                  onOpenSources={() => setView("sources")}
                  onToggleCloudFallback={() =>
                    setAiConfig((current) => normalizeAiConfig({ ...current, cloudFallback: !current.cloudFallback }))
                  }
                />
                <OnboardingDock
                  open={showOnboarding}
                  hasSource={Boolean(activeFile)}
                  onToggle={() => setShowOnboarding((open) => !open)}
                  onOpenSources={() => setView("sources")}
                  onOpenSpaces={() => setView("spaces")}
                />
              </div>
            </div>

            {hasStudyPanel && (
              <aside className="hidden w-[420px] shrink-0 overflow-y-auto border-l border-border bg-background p-4 xl:block">
                <div className="mb-3">
                  <p className="text-xs font-medium uppercase text-muted-foreground">Study Panel</p>
                  <h2 className="text-lg font-semibold text-foreground">学习结果</h2>
                </div>
                <QuizRenderer payload={quiz} />
                <FlashcardRenderer payload={flashcards} />
                {notesSource && <NotesPanel source={notesSource} />}
              </aside>
            )}
          </div>
        )}

        {view === "history" && <HistoryView messages={messages} newChat={newChat} />}

        {view === "sources" && (
          <ViewShell title="来源" subtitle="上传的文件会成为本地知识库。问答时先检索本地资料，不足时再让云端模型补充。">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="rounded-xl border border-border bg-card p-4 shadow-subtle">
                <FileUploader activeFile={activeFile} onUploaded={handleUploaded} />
              </div>
              <div className="rounded-xl border border-border bg-card p-4 shadow-subtle">
                <div className="mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">知识库列表</h3>
                </div>
                <div className="space-y-2">
                  {sources.length ? (
                    sources.map((source) => (
                      <button
                        key={source.fileId}
                        className={cn(
                          "lk-focus w-full rounded-md border px-3 py-2 text-left text-sm transition",
                          activeFile?.fileId === source.fileId
                            ? "border-brand-200 bg-brand-50"
                            : "border-border hover:bg-accent"
                        )}
                        type="button"
                        onClick={() => setActiveFile(source)}
                      >
                        <span className="block truncate font-medium">{source.name}</span>
                        <span className="text-xs text-muted-foreground">{source.chunkCount} 个文本片段</span>
                      </button>
                    ))
                  ) : (
                    <p className="rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground">
                      暂无本地知识库。上传 txt / md / csv 后即可选择。
                    </p>
                  )}
                </div>
              </div>
            </div>
          </ViewShell>
        )}

        {view === "spaces" && (
          <ViewShell title="空间" subtitle="按课程、项目或考试组织本地资料与对话。">
            <SpacesList spaces={spaces} onCreate={() => setNewSpaceOpen(true)} />
          </ViewShell>
        )}

        {view === "settings" && (
          <ViewShell title="集成设置" subtitle="在这里配置 DeepSeek、硅基流动、OpenAI、Anthropic 或自定义兼容接口。">
            <SettingsPanel />
          </ViewShell>
        )}
      </section>

      <NewSpaceModal
        open={newSpaceOpen}
        onClose={() => setNewSpaceOpen(false)}
        onCreate={(space) => setSpaces((prev) => [space, ...prev])}
      />
    </main>
  );
}

function Sidebar({
  view,
  setView,
  newChat,
  activeFile,
  username,
  onClose
}: {
  view: AppView;
  setView: (view: AppView) => void;
  newChat: () => void;
  activeFile: SourceFile | null;
  username: string;
  onClose: () => void;
}) {
  return (
    <aside className="hidden w-80 shrink-0 border-r border-border bg-sidebar md:flex md:flex-col">
      <div className="flex h-20 items-center gap-4 border-b border-border px-7">
        <button
          className="lk-focus -ml-2 inline-flex h-9 w-9 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100"
          type="button"
          onClick={onClose}
          aria-label="隐藏侧边栏"
        >
          <PanelLeft className="h-5 w-5" />
        </button>
        <span className="text-xl font-bold text-brand-500">LearnKata</span>
      </div>

      <div className="px-4 py-5">
        <button
          className="lk-focus flex h-9 w-full items-center justify-center gap-2 rounded-full border border-brand-200 bg-brand-50 text-sm font-medium text-brand-500 transition hover:bg-brand-100"
          type="button"
          onClick={newChat}
        >
          <SquarePen className="h-4 w-4" />
          新建对话
        </button>
      </div>

      <nav className="px-4">
        <p className="mb-3 px-3 text-sm font-semibold text-neutral-600">主要的</p>
        <SidebarItem icon={Folder} label="空间" active={view === "spaces"} onClick={() => setView("spaces")} />
        <SidebarItem icon={FolderPlus} label="新空间" inset active={false} onClick={() => setView("spaces")} />
        <SidebarItem icon={MessageSquare} label="聊天记录" active={view === "history"} onClick={() => setView("history")} />
        <SidebarItem icon={Database} label="来源" active={view === "sources"} onClick={() => setView("sources")} />
      </nav>

      <div className="mt-auto border-t border-border p-4">
        <button className="mb-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background text-sm text-neutral-700 shadow-subtle">
          <MessageCircle className="h-4 w-4" />
          加入我们的 Discord
        </button>
        <div className="space-y-1">
          <SidebarItem icon={Blocks} label="集成" active={view === "settings"} onClick={() => setView("settings")} />
          <SidebarItem icon={LifeBuoy} label="反馈与支持" active={false} onClick={() => setView("settings")} />
        </div>
        <button className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full border border-brand-200 bg-brand-50 text-base font-medium text-brand-500">
          <Zap className="h-4 w-4" />
          升级
        </button>
        <div className="mt-9 flex items-center gap-3">
          <img className="h-10 w-10 rounded-full" src="/LearnKataMascot.png" alt="" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg text-neutral-800">{username}</p>
            <p className="truncate text-sm text-muted-foreground">
              {activeFile ? `已连接 ${activeFile.name}` : `${username}@local`}
            </p>
          </div>
          <MoreVertical className="h-5 w-5 text-neutral-700" />
        </div>
      </div>
    </aside>
  );
}

function SidebarItem({
  icon: Icon,
  label,
  active,
  inset,
  onClick
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  inset?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "lk-focus flex h-10 w-full items-center gap-3 rounded-md px-3 text-left text-lg transition",
        inset && "pl-9 text-base",
        active ? "bg-neutral-100 text-brand-500" : "text-neutral-900 hover:bg-neutral-100"
      )}
      type="button"
      onClick={onClick}
    >
      <Icon className={cn("h-5 w-5", active ? "text-brand-500" : "text-neutral-900")} />
      <span>{label}</span>
    </button>
  );
}

function ChatHeader({
  mode,
  onModeChange,
  setView,
  newChat,
  sidebarOpen,
  onToggleSidebar
}: {
  mode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  setView: (view: AppView) => void;
  newChat: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}) {
  return (
    <header className="flex h-20 shrink-0 items-center justify-between gap-4 px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          className={cn(
            "lk-focus inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-neutral-800 hover:bg-neutral-100",
            sidebarOpen && "md:hidden"
          )}
          type="button"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "隐藏侧边栏" : "打开侧边栏"}
        >
          <PanelLeft className="h-5 w-5" />
        </button>
        <div className="flex min-w-0 rounded-lg bg-neutral-100 p-1 shadow-subtle">
          {topModes.map((item) => {
            const Icon = item.icon;
            const active = mode === item.mode;
            return (
              <button
                key={item.mode}
                className={cn(
                  "lk-focus flex h-10 items-center gap-2 rounded-md px-4 text-base transition",
                  active ? "bg-background text-neutral-950 shadow-subtle" : "text-muted-foreground hover:text-neutral-900"
                )}
                type="button"
                onClick={() => onModeChange(item.mode)}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-4 text-sm text-muted-foreground">
        <button className="hidden hover:text-neutral-900 md:inline" type="button" onClick={() => setView("sources")}>
          打开文件查看器
        </button>
        <button
          className="lk-focus rounded-md p-1 text-neutral-900 hover:bg-neutral-100"
          type="button"
          onClick={() => setView("history")}
          aria-label="聊天记录"
        >
          <History className="h-5 w-5" />
        </button>
        <button
          className="lk-focus rounded-md p-1 text-neutral-900 hover:bg-neutral-100"
          type="button"
          onClick={newChat}
          aria-label="新建对话"
        >
          <SquarePen className="h-5 w-5" />
        </button>
        <button
          className="lk-focus rounded-md p-1 text-neutral-900 hover:bg-neutral-100"
          type="button"
          onClick={() => setView("settings")}
          aria-label="设置"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}

function EmptyChat({
  username,
  onUsernameChange,
  onOpenSources,
  onOpenSettings,
  onUsePrompt
}: {
  username: string;
  onUsernameChange: (value: string) => void;
  onOpenSources: () => void;
  onOpenSettings: () => void;
  onUsePrompt: (mode: ChatMode, text: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(username);

  useEffect(() => {
    setDraft(username);
  }, [username]);

  function commit() {
    onUsernameChange(draft);
    setEditing(false);
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[840px] flex-col px-5 pb-8 pt-24">
      <div className="text-center">
        <img className="mx-auto h-20 w-20 object-contain" src="/LearnKataMascot.png" alt="" />
        <div className="mt-2 flex justify-center">
          {editing ? (
            <input
              className="lk-focus w-full max-w-[620px] rounded-md border border-border bg-background px-4 py-2 text-center font-serif text-[40px] font-bold leading-tight tracking-normal text-neutral-950"
              value={draft}
              autoFocus
              onChange={(event) => setDraft(event.target.value)}
              onBlur={commit}
              onKeyDown={(event) => {
                if (event.key === "Enter") commit();
                if (event.key === "Escape") {
                  setDraft(username);
                  setEditing(false);
                }
              }}
            />
          ) : (
            <button
              className="lk-focus rounded-md px-2 font-serif text-[40px] font-bold leading-tight tracking-normal text-neutral-950 hover:bg-neutral-50"
              type="button"
              onClick={() => setEditing(true)}
              title="点击修改用户名"
            >
              欢迎回来， {username}
            </button>
          )}
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <PromptPill icon={BookOpen} label="向我解释" onClick={() => onUsePrompt("teach", "请用通俗方式解释：")} />
          <PromptPill icon={ClipboardList} label="考考我" onClick={() => onUsePrompt("quiz", "请基于这些内容出一组测验：")} />
          <PromptPill icon={Layers} label="创建闪卡" onClick={() => onUsePrompt("flashcard", "请把这些内容整理成闪卡：")} />
          <PromptPill icon={FileText} label="帮我写笔记" onClick={() => onUsePrompt("notes", "请帮我整理成结构化笔记：")} />
        </div>
      </div>

      <div className="mt-10">
        <p className="mb-5 text-xl text-muted-foreground">开始</p>
        <div className="grid gap-4 md:grid-cols-4">
          <QuickAction icon={Upload} title="上传" desc="PDF 或音频" onClick={onOpenSources} />
          <QuickAction icon={Mic} title="录制" desc="现场讲座" onClick={onOpenSources} />
          <QuickAction icon={Link} title="链接" desc="YouTube，网站" onClick={onOpenSettings} />
          <QuickAction icon={Clipboard} title="粘贴" desc="笔记、文本" onClick={onOpenSources} />
        </div>
      </div>
    </div>
  );
}

function PromptPill({
  icon: Icon,
  label,
  onClick
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="lk-focus flex h-10 items-center gap-2 rounded-full border border-border bg-background px-4 text-base text-neutral-700 shadow-subtle hover:bg-neutral-50"
      type="button"
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function OnboardingDock({
  open,
  hasSource,
  onToggle,
  onOpenSources,
  onOpenSpaces
}: {
  open: boolean;
  hasSource: boolean;
  onToggle: () => void;
  onOpenSources: () => void;
  onOpenSpaces: () => void;
}) {
  return (
    <div className="mt-3">
      <button
        className="lk-focus mx-auto flex h-9 items-center gap-2 rounded-full border border-border bg-background px-4 text-sm text-muted-foreground shadow-subtle hover:bg-neutral-50 hover:text-neutral-900"
        type="button"
        onClick={onToggle}
      >
        {open ? "隐藏入门步骤" : "显示入门步骤"}
        <ChevronDown className={cn("h-4 w-4 transition", open && "rotate-180")} />
      </button>
      {open && (
        <div className="mt-3 rounded-xl border border-border bg-card p-5 shadow-subtle">
          <ChecklistItem done={false} label="创建一个空间" action="创建空间" onClick={onOpenSpaces} />
          <ChecklistItem
            done={hasSource}
            label="上传您的笔记"
            action={hasSource ? "已连接" : "先上传文件"}
            onClick={onOpenSources}
          />
          <ChecklistItem done={false} label="在您的空间中打开一个文件" action="打开来源" onClick={onOpenSources} />
        </div>
      )}
    </div>
  );
}

function HistoryView({ messages, newChat }: { messages: ChatMessage[]; newChat: () => void }) {
  const firstUser = messages.find((message) => message.role === "user");

  return (
    <div className="lk-scrollbar min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-[1060px] px-8 py-10">
        <div className="mb-8 flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold text-neutral-950">你的聊天记录</h1>
          <Button className="h-11 rounded-md bg-brand-500 px-6 text-base text-white hover:bg-brand-600" onClick={newChat}>
            <Plus className="h-5 w-5" />
            发起新聊天
          </Button>
        </div>

        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            className="lk-focus h-12 w-full rounded-md border border-border bg-background pl-12 pr-4 text-base shadow-subtle placeholder:text-slate-500"
            placeholder="搜索所有聊天记录..."
          />
        </label>

        <div className="mt-6 flex items-center justify-between text-base text-muted-foreground">
          <span>显示第 {firstUser ? "1-1" : "0-0"} 条，共 {firstUser ? 1 : 0} 条聊天记录</span>
          <div className="flex items-center gap-3">
            <span>显示:</span>
            <button className="flex h-11 items-center gap-4 rounded-md border border-border bg-background px-4 text-neutral-900 shadow-subtle">
              10
              <ArrowRight className="h-4 w-4 rotate-90 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="mt-7">
          {firstUser ? (
            <button className="lk-focus w-full rounded-lg border border-border bg-card px-5 py-5 text-left shadow-subtle hover:bg-neutral-50">
              <p className="truncate text-xl text-neutral-950">{firstUser.content}</p>
              <p className="mt-3 text-base text-muted-foreground">最后一条消息 刚刚</p>
            </button>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-card px-5 py-8 text-center text-muted-foreground">
              还没有聊天记录。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ViewShell({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="lk-scrollbar min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-8 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-neutral-950">{title}</h1>
          <p className="mt-2 text-base text-muted-foreground">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  title,
  desc,
  onClick
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      className="lk-focus flex min-h-[112px] flex-col items-start justify-between rounded-lg border border-border bg-background p-4 text-left shadow-subtle transition hover:bg-neutral-50"
      type="button"
      onClick={onClick}
    >
      <Icon className="h-5 w-5 text-muted-foreground" />
      <span>
        <span className="block text-lg text-neutral-950">{title}</span>
        <span className="block text-base text-muted-foreground">{desc}</span>
      </span>
    </button>
  );
}

function ChecklistItem({
  done,
  label,
  action,
  onClick
}: {
  done: boolean;
  label: string;
  action?: string;
  onClick?: () => void;
}) {
  return (
    <div className="flex items-center gap-4 py-2">
      {done ? (
        <CheckCircle2 className="h-6 w-6 shrink-0 text-brand-500" />
      ) : (
        <span className="block h-6 w-6 shrink-0 rounded-full border-2 border-neutral-300" />
      )}
      <span className={cn("min-w-0 flex-1 text-lg", done ? "text-muted-foreground" : "text-neutral-950")}>{label}</span>
      {action && (
        <button
          className="lk-focus flex h-9 shrink-0 items-center gap-3 rounded-md border border-border bg-background px-4 text-sm text-neutral-700 shadow-subtle disabled:text-muted-foreground"
          type="button"
          onClick={onClick}
          disabled={done}
        >
          {action}
          {done ? <CheckCircle2 className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}
