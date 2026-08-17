import { AnswerCard } from "./components/AnswerCard";
import { AppHeader } from "./components/AppHeader";
import { EmptyState } from "./components/EmptyState";
import { LoadingCard } from "./components/LoadingCard";
import { QuestionForm } from "./components/QuestionForm";
import { SuggestedQuestions } from "./components/SuggestedQuestions";
import { suggestedQuestions } from "./data/suggestedQuestions";
import { useResumeQuestions } from "./hooks/useResumeQuestions";

function App() {
  const { entries, isLoading, askQuestion, clearHistory } = useResumeQuestions();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <div
          className="mb-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-950"
          role="note"
        >
          <strong>Each question is answered independently.</strong> Include all relevant
          context in your question.
        </div>

        <QuestionForm isLoading={isLoading} onAsk={askQuestion} />

        <div className="mt-7">
          <SuggestedQuestions
            questions={suggestedQuestions}
            disabled={isLoading}
            onSelect={(question) => {
              askQuestion(question);
            }}
          />
        </div>

        <section aria-labelledby="results-heading" className="mt-9">
          <div className="mb-4 flex min-h-8 items-center justify-between gap-4">
            <h2 id="results-heading" className="text-lg font-semibold text-slate-950">
              Questions and answers
            </h2>
            {entries.length > 0 && (
              <button
                type="button"
                onClick={clearHistory}
                className="rounded px-2 py-1 text-sm font-medium text-slate-500 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Clear history
              </button>
            )}
          </div>

          {entries.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-4">
              {entries.map((entry) =>
                entry.status === "loading" ? (
                  <LoadingCard key={entry.id} question={entry.question} />
                ) : (
                  <AnswerCard key={entry.id} entry={entry} />
                ),
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
