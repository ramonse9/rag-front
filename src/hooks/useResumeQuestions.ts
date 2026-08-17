import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { askResumeQuestion, RagApiError } from "../api/ragApi";
import type { QuestionEntry } from "../types/rag";

function createEntryId(): string {
  return globalThis.crypto.randomUUID();
}

export function useResumeQuestions() {
  const [entries, setEntries] = useState<QuestionEntry[]>([]);
  const activeController = useRef<AbortController | null>(null);

  const isLoading = useMemo(
    () => entries.some((entry) => entry.status === "loading"),
    [entries],
  );

  const askQuestion = useCallback((rawQuestion: string): boolean => {
    const question = rawQuestion.trim();
    if (!question || activeController.current) {
      return false;
    }

    const controller = new AbortController();
    const entryId = createEntryId();
    const createdAt = Date.now();
    activeController.current = controller;

    setEntries((current) => [
      ...current,
      { id: entryId, createdAt, question, status: "loading" },
    ]);

    void askResumeQuestion(question, controller.signal)
      .then((response) => {
        setEntries((current) =>
          current.map((entry) =>
            entry.id === entryId
              ? { id: entryId, createdAt, question, status: "success", response }
              : entry,
          ),
        );
      })
      .catch((error: unknown) => {
        if (error instanceof RagApiError && error.code === "cancelled") {
          setEntries((current) => current.filter((entry) => entry.id !== entryId));
          return;
        }

        const message =
          error instanceof RagApiError
            ? error.message
            : "Something went wrong while answering your question. Please try again.";

        setEntries((current) =>
          current.map((entry) =>
            entry.id === entryId
              ? { id: entryId, createdAt, question, status: "error", message }
              : entry,
          ),
        );
      })
      .finally(() => {
        if (activeController.current === controller) {
          activeController.current = null;
        }
      });

    return true;
  }, []);

  const clearHistory = useCallback(() => {
    activeController.current?.abort();
    activeController.current = null;
    setEntries([]);
  }, []);

  useEffect(
    () => () => {
      activeController.current?.abort();
    },
    [],
  );

  return { entries, isLoading, askQuestion, clearHistory };
}
