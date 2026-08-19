import type { JobAnalysisResponse, RequirementMatch } from "../../types/jobAnalysis";
import { AnswerMarkdown } from "../AnswerMarkdown";
import { RequirementEvaluationCard } from "./RequirementEvaluationCard";

interface JobAnalysisResultProps {
  result: JobAnalysisResponse;
  onClear: () => void;
}

function capitalize(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

export function JobAnalysisResult({ result, onClear }: JobAnalysisResultProps) {
  const counts = result.evaluations.reduce<Record<RequirementMatch, number>>(
    (summary, evaluation) => {
      summary[evaluation.match] += 1;
      return summary;
    },
    { strong: 0, partial: 0, gap: 0 },
  );

  const visibleIntent = result.intent && result.intent !== "unsupported";

  return (
    <section
      aria-labelledby="job-analysis-result-heading"
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">
            Analysis result
          </p>
          <h3 id="job-analysis-result-heading" className="mt-1 text-lg font-semibold text-slate-950">
            {result.question}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="rounded px-2 py-1 text-sm font-medium text-slate-500 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Clear analysis
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
          Engine: LangGraph
        </span>
        {visibleIntent && (
          <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-800">
            Intent: {capitalize(result.intent!)}
          </span>
        )}
      </div>

      {!result.requestValid && result.validationReason && (
        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
          <span className="font-semibold text-slate-900">Analysis note:</span>{" "}
          {result.validationReason}
        </div>
      )}

      <div className="mt-5 border-t border-slate-100 pt-5">
        <p className="mb-3 text-xs font-semibold tracking-wide text-blue-700 uppercase">
          Answer
        </p>
        <AnswerMarkdown>{result.answer}</AnswerMarkdown>
      </div>

      {result.evaluations.length > 0 && (
        <section aria-labelledby="requirement-analysis-heading" className="mt-7 border-t border-slate-200 pt-6">
          <h4 id="requirement-analysis-heading" className="text-base font-semibold text-slate-950">
            Requirement analysis
          </h4>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:max-w-md">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              <span className="font-semibold">Strong:</span> {counts.strong}
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              <span className="font-semibold">Partial:</span> {counts.partial}
            </div>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
              <span className="font-semibold">Gaps:</span> {counts.gap}
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {result.evaluations.map((evaluation, index) => (
              <RequirementEvaluationCard
                key={`${evaluation.requirement}-${index}`}
                evaluation={evaluation}
              />
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
