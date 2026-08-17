interface LoadingCardProps {
  question: string;
}

export function LoadingCard({ question }: LoadingCardProps) {
  return (
    <article className="rounded-xl border border-blue-200 bg-white p-5 shadow-sm sm:p-6">
      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Question</p>
      <h3 className="mt-2 text-base font-semibold leading-6 text-slate-950">{question}</h3>
      <div
        role="status"
        aria-live="polite"
        className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5 text-sm text-slate-600"
      >
        <span className="loading-indicator" aria-hidden="true" />
        <span>Searching the resume and generating an answer...</span>
      </div>
    </article>
  );
}
