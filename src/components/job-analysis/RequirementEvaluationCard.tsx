import type { RequirementEvaluation } from "../../types/jobAnalysis";

interface RequirementEvaluationCardProps {
  evaluation: RequirementEvaluation;
}

const matchStyles: Record<RequirementEvaluation["match"], string> = {
  strong: "border-emerald-200 bg-emerald-50 text-emerald-800",
  partial: "border-amber-200 bg-amber-50 text-amber-800",
  gap: "border-rose-200 bg-rose-50 text-rose-800",
};

function capitalize(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

export function RequirementEvaluationCard({
  evaluation,
}: RequirementEvaluationCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h4 className="break-words text-sm font-semibold leading-6 text-slate-950">
          {evaluation.requirement}
        </h4>
        <div className="flex shrink-0 flex-wrap gap-2">
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
            {capitalize(evaluation.importance)}
          </span>
          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${matchStyles[evaluation.match]}`}
          >
            {capitalize(evaluation.match)}
          </span>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">{evaluation.explanation}</p>

      {evaluation.evidence.length > 0 && (
        <details className="mt-4 border-t border-slate-200 pt-3">
          <summary className="w-fit cursor-pointer rounded text-sm font-semibold text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600">
            Supporting evidence ({evaluation.evidence.length})
          </summary>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
            {evaluation.evidence.map((evidenceItem, index) => (
              <li key={`${evidenceItem}-${index}`} className="break-words pl-1">
                {evidenceItem}
              </li>
            ))}
          </ul>
        </details>
      )}
    </article>
  );
}
