export interface RagSource {
  chunkIndex: number;
  distance: number;
  filename: string;
  content: string;
}

export interface RagResponse {
  question: string;
  answer: string;
  sources: RagSource[];
}

export type RagEngine = "native" | "langchain";

interface QuestionEntryBase {
  id: string;
  createdAt: number;
  question: string;
  engine: RagEngine;
}

export type QuestionEntry =
  | (QuestionEntryBase & { status: "loading" })
  | (QuestionEntryBase & { status: "success"; response: RagResponse })
  | (QuestionEntryBase & { status: "error"; message: string });
