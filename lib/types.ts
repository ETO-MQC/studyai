export type ChatMode =
  | "chat"
  | "teach"
  | "code"
  | "file_qa"
  | "summary"
  | "rewrite"
  | "translate"
  | "quiz"
  | "flashcard"
  | "notes";

export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: Exclude<ChatRole, "system">;
  content: string;
  citations?: Citation[];
}

export interface QuizQuestion {
  type: "multiple-choice" | "true-false" | "short-answer";
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

export interface QuizPayload {
  questions: QuizQuestion[];
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface FlashcardPayload {
  cards: Flashcard[];
}

export type FlashcardReviewStatus = "again" | "known";

export interface QuizAnswerRecord {
  question: string;
  selected: string;
  answer: string;
  correct: boolean;
  explanation: string;
  answeredAt: number;
}

export interface FlashcardReviewRecord {
  front: string;
  back: string;
  status: FlashcardReviewStatus;
  reviewedAt: number;
  dueAt: number;
}

export interface StudyProgress {
  quizAnswers: Record<string, QuizAnswerRecord>;
  flashcards: Record<string, FlashcardReviewRecord>;
}

export interface MindmapNode {
  id: string;
  title: string;
  children: MindmapNode[];
  collapsed?: boolean;
  sourceCitation?: Citation;
}

export interface MindmapPayload {
  root: MindmapNode;
}

export interface SourceFile {
  fileId: string;
  name: string;
  chunkCount: number;
}

export interface SourceDocument {
  sourceId: string;
  fileName: string;
  mimeType: string;
  chunkCount: number;
  createdAt: number;
}

export interface SourceChunk {
  sourceId: string;
  fileName: string;
  chunkIndex: number;
  locator: string;
  text: string;
}

export interface Citation {
  sourceId: string;
  fileName: string;
  chunkIndex: number;
  locator: string;
  excerpt: string;
  score: number;
}

export interface Space {
  id: string;
  name: string;
  description: string;
  color: string;
}
