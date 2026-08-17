import { useState, type FormEvent, type KeyboardEvent } from "react";

interface QuestionFormProps {
  isLoading: boolean;
  onAsk: (question: string) => boolean;
}

export function QuestionForm({ isLoading, onAsk }: QuestionFormProps) {
  const [question, setQuestion] = useState("");
  const isEmpty = question.trim().length === 0;

  const submit = () => {
    if (isEmpty || isLoading) return;
    if (onAsk(question)) {
      setQuestion("");
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
    >
      <label htmlFor="resume-question" className="text-sm font-semibold text-slate-900">
        Ask about Ramon&apos;s resume
      </label>
      <textarea
        id="resume-question"
        name="question"
        rows={4}
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        placeholder="For example: What experience does Ramon have designing SaaS architectures?"
        className="mt-3 block w-full resize-y rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-base leading-6 text-slate-900 shadow-inner placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
      />
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          Press <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>Enter</kbd> to submit.
        </p>
        <button
          type="submit"
          disabled={isEmpty || isLoading}
          className="inline-flex min-h-10 items-center justify-center rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
        >
          {isLoading ? "Working..." : "Ask"}
        </button>
      </div>
    </form>
  );
}
