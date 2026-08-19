import { useState } from "react";
import { AnswerCard } from "./components/AnswerCard";
import { AppHeader } from "./components/AppHeader";
import { EmptyState } from "./components/EmptyState";
import { LoadingCard } from "./components/LoadingCard";
import { QuestionForm } from "./components/QuestionForm";
import { SuggestedQuestions } from "./components/SuggestedQuestions";
import { JobAnalysis } from "./components/job-analysis/JobAnalysis";
import { suggestedQuestions } from "./data/suggestedQuestions";
import { useResumeQuestions } from "./hooks/useResumeQuestions";
import type { RagEngine } from "./types/rag";

type AppExperience = "resume" | "job-analysis";

function App() {
  const [activeExperience, setActiveExperience] =
    useState<AppExperience>("resume");
  const [selectedEngine, setSelectedEngine] = useState<RagEngine>("native");
  const { entries, isLoading, askQuestion, clearHistory } = useResumeQuestions();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <nav aria-label="Application sections" className="mb-7">
          <div
            role="tablist"
            aria-label="Resume tools"
            className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1"
          >
            <button
              type="button"
              role="tab"
              id="resume-tab"
              aria-selected={activeExperience === "resume"}
              aria-controls="resume-panel"
              onClick={() => setActiveExperience("resume")}
              className="rounded-md px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 aria-selected:bg-white aria-selected:text-blue-700 aria-selected:shadow-sm"
            >
              Resume Q&amp;A
            </button>
            <button
              type="button"
              role="tab"
              id="job-analysis-tab"
              aria-selected={activeExperience === "job-analysis"}
              aria-controls="job-analysis-panel"
              onClick={() => setActiveExperience("job-analysis")}
              className="rounded-md px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 aria-selected:bg-white aria-selected:text-blue-700 aria-selected:shadow-sm"
            >
              Job Analysis
            </button>
          </div>
        </nav>

        <section
          id="resume-panel"
          role="tabpanel"
          aria-labelledby="resume-tab"
          hidden={activeExperience !== "resume"}
        >
          <div
            className="mb-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-950"
            role="note"
          >
            <strong>Each question is answered independently.</strong> Include all relevant
            context in your question.
          </div>

          <QuestionForm
            isLoading={isLoading}
            selectedEngine={selectedEngine}
            onEngineChange={setSelectedEngine}
            onAsk={askQuestion}
          />

          <div className="mt-7">
            <SuggestedQuestions
              questions={suggestedQuestions}
              disabled={isLoading}
              onSelect={(question) => {
                askQuestion(question, selectedEngine);
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
        </section>

        <section
          id="job-analysis-panel"
          role="tabpanel"
          aria-labelledby="job-analysis-tab"
          hidden={activeExperience !== "job-analysis"}
        >
          <JobAnalysis />
        </section>
      </main>
    </div>
  );
}

export default App;
