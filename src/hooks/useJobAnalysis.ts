import { useCallback, useEffect, useRef, useState } from "react";
import { analyzeJob, JobAnalysisError } from "../api/jobAnalysisApi";
import type { JobAnalysisResponse } from "../types/jobAnalysis";

type JobAnalysisState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: JobAnalysisResponse }
  | { status: "error"; message: string };

export function useJobAnalysis() {
  const [state, setState] = useState<JobAnalysisState>({ status: "idle" });
  const activeController = useRef<AbortController | null>(null);

  const analyze = useCallback(
    (rawJobDescription: string, rawQuestion: string): boolean => {
      const jobDescription = rawJobDescription.trim();
      const question = rawQuestion.trim();

      if (!jobDescription || !question || activeController.current) {
        return false;
      }

      const controller = new AbortController();
      activeController.current = controller;
      setState({ status: "loading" });

      void analyzeJob(jobDescription, question, controller.signal)
        .then((result) => {
          if (!controller.signal.aborted) {
            setState({ status: "success", result });
          }
        })
        .catch((error: unknown) => {
          if (error instanceof JobAnalysisError && error.code === "cancelled") {
            setState({ status: "idle" });
            return;
          }

          setState({
            status: "error",
            message:
              error instanceof JobAnalysisError
                ? error.message
                : "Something went wrong while analyzing this job. Please try again.",
          });
        })
        .finally(() => {
          if (activeController.current === controller) {
            activeController.current = null;
          }
        });

      return true;
    },
    [],
  );

  const reset = useCallback(() => {
    activeController.current?.abort();
    activeController.current = null;
    setState({ status: "idle" });
  }, []);

  useEffect(
    () => () => {
      activeController.current?.abort();
    },
    [],
  );

  return {
    state,
    isLoading: state.status === "loading",
    analyze,
    reset,
  };
}
