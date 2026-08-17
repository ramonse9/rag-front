import ReactMarkdown from "react-markdown";

interface AnswerMarkdownProps {
  children: string;
}

export function AnswerMarkdown({ children }: AnswerMarkdownProps) {
  return (
    <ReactMarkdown
      skipHtml
      components={{
        h1: ({ children: heading }) => (
          <h3 className="mt-5 mb-2 text-xl font-bold text-slate-950 first:mt-0">{heading}</h3>
        ),
        h2: ({ children: heading }) => (
          <h3 className="mt-5 mb-2 text-lg font-bold text-slate-950 first:mt-0">{heading}</h3>
        ),
        h3: ({ children: heading }) => (
          <h3 className="mt-4 mb-2 text-base font-bold text-slate-950 first:mt-0">{heading}</h3>
        ),
        p: ({ children: paragraph }) => (
          <p className="my-3 leading-7 text-slate-700 first:mt-0 last:mb-0">{paragraph}</p>
        ),
        strong: ({ children: strong }) => (
          <strong className="font-semibold text-slate-950">{strong}</strong>
        ),
        ul: ({ children: list }) => (
          <ul className="my-3 list-disc space-y-1.5 pl-6 text-slate-700">{list}</ul>
        ),
        ol: ({ children: list }) => (
          <ol className="my-3 list-decimal space-y-1.5 pl-6 text-slate-700">{list}</ol>
        ),
        li: ({ children: item }) => <li className="pl-1 leading-7">{item}</li>,
        code: ({ children: code }) => (
          <code className="break-words rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-slate-800">
            {code}
          </code>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
