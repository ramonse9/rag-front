import { useState, type FormEvent } from "react";
import { jobAnalysisQuestions } from "../../data/jobAnalysisQuestions";

interface JobAnalysisFormProps {
  isLoading: boolean;
  onAnalyze: (jobDescription: string, question: string) => boolean;
}

export function JobAnalysisForm({ isLoading, onAnalyze }: JobAnalysisFormProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [question, setQuestion] = useState("");
  const canSubmit =
    jobDescription.trim().length > 0 && question.trim().length > 0 && !isLoading;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSubmit) {
      onAnalyze(jobDescription, question);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
    >
      <div>
        <label
          htmlFor="job-description"
          className="text-sm font-semibold tracking-wide text-slate-900 uppercase"
        >
          Job description
        </label>
        <textarea
          id="job-description"
          name="jobDescription"
          rows={9}
          value={jobDescription}
          onChange={(event) => setJobDescription(event.target.value)}
          disabled={isLoading}
          placeholder="Paste the job description here..."
          className="mt-3 block w-full resize-y rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-base leading-6 text-slate-900 shadow-inner placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
        />
      </div>

      <fieldset className="mt-6" disabled={isLoading}>
        <legend className="text-sm font-semibold tracking-wide text-slate-900 uppercase">
          Question
        </legend>
        <p className="mt-2 text-sm text-slate-500">
          Choose a suggestion or ask your own question.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {jobAnalysisQuestions.map((suggestedQuestion) => {
            const isSelected = question === suggestedQuestion;
            return (
              <button
                key={suggestedQuestion}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setQuestion(suggestedQuestion)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-left text-sm leading-5 text-slate-700 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 aria-pressed:border-blue-300 aria-pressed:bg-blue-50 aria-pressed:text-blue-950 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              >
                {suggestedQuestion}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-5">
        <label htmlFor="job-analysis-question" className="text-sm font-semibold text-slate-900">
          Custom question
        </label>
        <input
          id="job-analysis-question"
          name="question"
          type="text"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          disabled={isLoading}
          placeholder="Ask anything about this job analysis..."
          className="mt-2 block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-900 shadow-inner placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
        />
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex min-h-10 items-center justify-center rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 max-sm:w-full"
        >
          {isLoading ? "Analyzing..." : "Analyze job"}
        </button>
      </div>
    </form>
  );
}
