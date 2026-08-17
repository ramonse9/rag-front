import type { QuestionEntry } from "../types/rag";
import { AnswerMarkdown } from "./AnswerMarkdown";
import { SourcesDisclosure } from "./SourcesDisclosure";

type CompletedEntry = Extract<QuestionEntry, { status: "success" | "error" }>;

interface AnswerCardProps {
  entry: CompletedEntry;
}

export function AnswerCard({ entry }: AnswerCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Question</p>
      <h3 className="mt-2 text-base font-semibold leading-6 text-slate-950">
        {entry.question}
      </h3>

      {entry.status === "error" ? (
        <div
          role="alert"
          className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
        >
          {entry.message}
        </div>
      ) : (
        <div className="mt-5 border-t border-slate-100 pt-5">
          <p className="mb-3 text-xs font-semibold tracking-wide text-blue-700 uppercase">
            Answer
          </p>
          <AnswerMarkdown>{entry.response.answer}</AnswerMarkdown>
          <SourcesDisclosure sources={entry.response.sources} />
        </div>
      )}
    </article>
  );
}
