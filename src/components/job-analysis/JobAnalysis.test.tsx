import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../../App";

const JOB_DESCRIPTION =
  "Senior AI Software Architect with React, TypeScript, RAG, LangChain, and LangGraph experience.";
const MATCH_QUESTION = "How strong is my match for this position?";

const successfulAnalysis = {
  jobDescription: JOB_DESCRIPTION,
  question: MATCH_QUESTION,
  requestValid: true,
  requirements: [
    {
      requirement: "React and TypeScript",
      category: "frontend",
      importance: "required",
    },
    {
      requirement: "LangGraph",
      category: "ai",
      importance: "preferred",
    },
    {
      requirement: "Team leadership",
      category: "leadership",
      importance: "valuable",
    },
  ],
  evidence: [
    {
      requirement: "React and TypeScript",
      evidence: [
        {
          content: "Raw retrieved resume chunk that should stay hidden.",
          filename: "resume.pdf",
          chunkIndex: 2,
          distance: 0.3123,
        },
      ],
    },
  ],
  evaluations: [
    {
      requirement: "React and TypeScript",
      importance: "required",
      match: "strong",
      explanation: "The profile shows extensive frontend architecture experience.",
      evidence: ["Built production React applications with strict TypeScript."],
    },
    {
      requirement: "LangGraph",
      importance: "preferred",
      match: "partial",
      explanation: "The profile has related agent workflow experience.",
      evidence: [],
    },
    {
      requirement: "Team leadership",
      importance: "valuable",
      match: "gap",
      explanation: "The supplied evidence does not establish this requirement.",
      evidence: [],
    },
  ],
  intent: "match",
  answer: "## Overall match\n\nThe profile is a **strong technical match**.",
} as const;

function jsonResponse(data: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    statusText: ok ? "OK" : "Server Error",
    json: vi.fn().mockResolvedValue(data),
  } as unknown as Response;
}

function deferredResponse() {
  let resolve!: (value: Response) => void;
  const promise = new Promise<Response>((promiseResolve) => {
    resolve = promiseResolve;
  });
  return { promise, resolve };
}

async function openJobAnalysis(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("tab", { name: "Job Analysis" }));
}

describe("Job Analysis Agent", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubEnv("VITE_API_BASE_URL", "http://localhost:3000/");
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("switches between the existing Resume Q&A and Job Analysis experiences", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole("tab", { name: "Resume Q&A" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await openJobAnalysis(user);

    expect(screen.getByRole("tab", { name: "Job Analysis" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("heading", { name: "Job Analysis Agent" })).toBeVisible();
    expect(screen.getByText("Powered by LangGraph")).toBeVisible();
  });

  it("requires both fields, trims the request, and prevents duplicate submissions", async () => {
    const user = userEvent.setup();
    const pending = deferredResponse();
    fetchMock.mockReturnValue(pending.promise);
    render(<App />);
    await openJobAnalysis(user);

    const submitButton = screen.getByRole("button", { name: "Analyze job" });
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByLabelText("Job description"), `  ${JOB_DESCRIPTION}  `);
    await user.click(screen.getByRole("button", { name: MATCH_QUESTION }));
    expect(screen.getByLabelText("Custom question")).toHaveValue(MATCH_QUESTION);
    expect(submitButton).toBeEnabled();

    await user.click(submitButton);
    fireEvent.click(screen.getByRole("button", { name: "Analyzing..." }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/job-analysis/analyze",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          jobDescription: JOB_DESCRIPTION,
          question: MATCH_QUESTION,
        }),
      }),
    );
    expect(
      screen.getByText("Analyzing the job description against the candidate profile..."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel analysis" }));
    expect(
      screen.queryByText("Analyzing the job description against the candidate profile..."),
    ).not.toBeInTheDocument();
    pending.resolve(jsonResponse(successfulAnalysis));
    await waitFor(() =>
      expect(screen.queryByText("Engine: LangGraph")).not.toBeInTheDocument(),
    );
  });

  it("renders Markdown, intent, match summary, evaluation badges, and expandable evidence", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(jsonResponse(successfulAnalysis));
    render(<App />);
    await openJobAnalysis(user);

    await user.type(screen.getByLabelText("Job description"), JOB_DESCRIPTION);
    await user.click(screen.getByRole("button", { name: MATCH_QUESTION }));
    await user.click(screen.getByRole("button", { name: "Analyze job" }));

    expect(await screen.findByText("Engine: LangGraph")).toBeInTheDocument();
    expect(screen.getByText("Intent: Match")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Overall match" })).toBeInTheDocument();
    expect(screen.getByText("strong technical match").tagName).toBe("STRONG");
    expect(screen.getByText("Strong:").parentElement).toHaveTextContent("Strong: 1");
    expect(screen.getByText("Partial:").parentElement).toHaveTextContent("Partial: 1");
    expect(screen.getByText("Gaps:").parentElement).toHaveTextContent("Gaps: 1");
    expect(screen.getByText("Strong", { selector: "span" })).toBeInTheDocument();
    expect(screen.getByText("Partial", { selector: "span" })).toBeInTheDocument();
    expect(screen.getByText("Gap", { selector: "span" })).toBeInTheDocument();

    expect(
      screen.getByText("Built production React applications with strict TypeScript."),
    ).not.toBeVisible();
    await user.click(screen.getByText("Supporting evidence (1)"));
    expect(
      screen.getByText("Built production React applications with strict TypeScript."),
    ).toBeVisible();
    expect(
      screen.queryByText("Raw retrieved resume chunk that should stay hidden."),
    ).not.toBeInTheDocument();
  });

  it("treats an invalid analysis request as a neutral successful result", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(
      jsonResponse({
        jobDescription: JOB_DESCRIPTION,
        question: MATCH_QUESTION,
        requestValid: false,
        validationReason: "The text does not contain enough job requirements.",
        requirements: [],
        evidence: [],
        evaluations: [],
        intent: "unsupported",
        answer: "Please provide a complete job description.",
      }),
    );
    render(<App />);
    await openJobAnalysis(user);

    await user.type(screen.getByLabelText("Job description"), JOB_DESCRIPTION);
    await user.type(screen.getByLabelText("Custom question"), MATCH_QUESTION);
    await user.click(screen.getByRole("button", { name: "Analyze job" }));

    expect(await screen.findByText("Engine: LangGraph")).toBeInTheDocument();
    expect(
      screen.getByText("The text does not contain enough job requirements."),
    ).toBeInTheDocument();
    expect(screen.getByText("Please provide a complete job description.")).toBeInTheDocument();
    expect(screen.queryByText("Intent: Unsupported")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Requirement analysis" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows a safe network error and can clear a successful analysis", async () => {
    const user = userEvent.setup();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    fetchMock.mockRejectedValueOnce(new TypeError("Internal network detail"));
    render(<App />);
    await openJobAnalysis(user);

    await user.type(screen.getByLabelText("Job description"), JOB_DESCRIPTION);
    await user.type(screen.getByLabelText("Custom question"), MATCH_QUESTION);
    await user.click(screen.getByRole("button", { name: "Analyze job" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Unable to reach the job analysis service");
    expect(alert).not.toHaveTextContent("Internal network detail");

    fetchMock.mockResolvedValueOnce(jsonResponse(successfulAnalysis));
    await user.click(screen.getByRole("button", { name: "Analyze job" }));
    await screen.findByText("Engine: LangGraph");
    await user.click(screen.getByRole("button", { name: "Clear analysis" }));
    await waitFor(() =>
      expect(screen.queryByText("Engine: LangGraph")).not.toBeInTheDocument(),
    );
  });
});
