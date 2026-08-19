import { useJobAnalysis } from "../../hooks/useJobAnalysis";
import { JobAnalysisForm } from "./JobAnalysisForm";
import { JobAnalysisResult } from "./JobAnalysisResult";

export function JobAnalysis() {
  const { state, isLoading, analyze, reset } = useJobAnalysis();

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm font-semibold text-blue-700">Powered by LangGraph</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
          Job Analysis Agent
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Compare a job description against the indexed candidate profile using an
          evidence-based LangGraph workflow.
        </p>
      </div>

      <JobAnalysisForm isLoading={isLoading} onAnalyze={analyze} />

      <div className="mt-6">
        {state.status === "loading" && (
          <div className="flex flex-col gap-4 rounded-xl border border-blue-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div
              role="status"
              aria-live="polite"
              className="flex items-center gap-3 text-sm text-slate-600"
            >
              <span className="loading-indicator" aria-hidden="true" />
              <span>Analyzing the job description against the candidate profile...</span>
            </div>
            <button
              type="button"
              onClick={reset}
              className="rounded px-2 py-1 text-sm font-medium text-slate-500 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Cancel analysis
            </button>
          </div>
        )}

        {state.status === "error" && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
          >
            {state.message}
          </div>
        )}

        {state.status === "success" && (
          <JobAnalysisResult result={state.result} onClear={reset} />
        )}
      </div>
    </div>
  );
}
