interface SuggestedQuestionsProps {
  questions: readonly string[];
  disabled: boolean;
  onSelect: (question: string) => void;
}

export function SuggestedQuestions({
  questions,
  disabled,
  onSelect,
}: SuggestedQuestionsProps) {
  return (
    <section aria-labelledby="suggested-questions-heading">
      <h2
        id="suggested-questions-heading"
        className="text-sm font-semibold text-slate-900"
      >
        Suggested questions
      </h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {questions.map((question) => (
          <button
            key={question}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(question)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-left text-sm leading-5 text-slate-700 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
          >
            {question}
          </button>
        ))}
      </div>
    </section>
  );
}
