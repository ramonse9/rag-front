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

interface QuestionEntryBase {
  id: string;
  createdAt: number;
  question: string;
}

export type QuestionEntry =
  | (QuestionEntryBase & { status: "loading" })
  | (QuestionEntryBase & { status: "success"; response: RagResponse })
  | (QuestionEntryBase & { status: "error"; message: string });
