import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

const QUESTION = "What experience does Ramon have with PostgreSQL?";

const successResponse = {
  question: QUESTION,
  answer: "Ramon has **direct PostgreSQL experience**.\n\n- Schema design\n- Query optimization",
  sources: [
    {
      chunkIndex: 0,
      distance: 0.5385348013199434,
      filename: "Ramon_Guzman_Senior_FullStack_Developer.pdf",
      content: "Ramon designed PostgreSQL schemas and optimized queries.",
    },
  ],
};

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

describe("AI Resume application", () => {
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

  it("rejects empty and whitespace-only form submissions", async () => {
    const user = userEvent.setup();
    render(<App />);

    const askButton = screen.getByRole("button", { name: "Ask" });
    const textarea = screen.getByLabelText("Ask about Ramon's resume");
    expect(askButton).toBeDisabled();

    await user.type(textarea, "   ");
    expect(askButton).toBeDisabled();
    fireEvent.submit(textarea.closest("form")!);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    ["Cmd+Enter", { metaKey: true }],
    ["Ctrl+Enter", { ctrlKey: true }],
  ])("submits with %s", async (_label, modifier) => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(jsonResponse(successResponse));
    render(<App />);

    const textarea = screen.getByLabelText("Ask about Ramon's resume");
    await user.type(textarea, QUESTION);
    fireEvent.keyDown(textarea, { key: "Enter", ...modifier });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({
      question: QUESTION,
    });
  });

  it("submits a suggested question immediately", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(jsonResponse(successResponse));
    render(<App />);

    await user.click(screen.getByRole("button", { name: QUESTION }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(screen.getByRole("heading", { name: QUESTION })).toBeInTheDocument();
  });

  it("uses Native RAG by default and routes LangChain requests to its endpoint", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(jsonResponse(successResponse));
    render(<App />);

    const nativeEngine = screen.getByRole("radio", { name: "Native RAG" });
    const langChainEngine = screen.getByRole("radio", { name: "LangChain" });
    expect(nativeEngine).toBeChecked();

    await user.click(langChainEngine);
    expect(langChainEngine).toBeChecked();
    await user.click(screen.getByRole("button", { name: QUESTION }));

    await screen.findByText("Engine: LangChain");
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/rag/langchain/ask",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("preserves the engine used by each completed answer", async () => {
    const user = userEvent.setup();
    const secondQuestion = "What AI technologies has Ramon worked with?";
    fetchMock
      .mockResolvedValueOnce(jsonResponse(successResponse))
      .mockResolvedValueOnce(
        jsonResponse({ ...successResponse, question: secondQuestion, answer: "AI experience" }),
      );
    render(<App />);

    await user.click(screen.getByRole("button", { name: QUESTION }));
    await screen.findByText("Engine: Native RAG");

    await user.click(screen.getByRole("radio", { name: "LangChain" }));
    await user.click(screen.getByRole("button", { name: secondQuestion }));
    await screen.findByText("Engine: LangChain");

    expect(screen.getByText("Engine: Native RAG")).toBeInTheDocument();
    expect(screen.getByText("Engine: LangChain")).toBeInTheDocument();
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "http://localhost:3000/api/rag/ask",
      "http://localhost:3000/api/rag/langchain/ask",
    ]);
  });

  it("shows the RAG loading state and disables submission controls", async () => {
    const user = userEvent.setup();
    const pending = deferredResponse();
    fetchMock.mockReturnValue(pending.promise);
    render(<App />);

    await user.click(screen.getByRole("button", { name: QUESTION }));

    expect(
      screen.getByText("Searching the resume and generating an answer..."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Working..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: QUESTION })).toBeDisabled();

    pending.resolve(jsonResponse(successResponse));
    await screen.findByText("direct PostgreSQL experience");
  });

  it("prevents duplicate requests while one is active", async () => {
    const user = userEvent.setup();
    const pending = deferredResponse();
    fetchMock.mockReturnValue(pending.promise);
    render(<App />);

    const suggestion = screen.getByRole("button", { name: QUESTION });
    await user.click(suggestion);
    fireEvent.click(suggestion);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    pending.resolve(jsonResponse(successResponse));
    await screen.findByText("direct PostgreSQL experience");
  });

  it("renders a successful answer with its submitted question", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(jsonResponse(successResponse));
    render(<App />);

    await user.click(screen.getByRole("button", { name: QUESTION }));

    expect(await screen.findByText("direct PostgreSQL experience")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: QUESTION })).toBeInTheDocument();
  });

  it("renders Markdown headings, bold text, lists, and inline code without raw HTML", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(
      jsonResponse({
        ...successResponse,
        answer: "## Highlights\n\nUses **PostgreSQL** with `pgvector`.\n\n- Design\n- Performance\n\n<script>alert('x')</script>",
      }),
    );
    render(<App />);

    await user.click(screen.getByRole("button", { name: QUESTION }));

    expect(await screen.findByRole("heading", { name: "Highlights" })).toBeInTheDocument();
    expect(screen.getByText("PostgreSQL").tagName).toBe("STRONG");
    expect(screen.getByText("pgvector").tagName).toBe("CODE");
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(document.querySelector("script")).not.toBeInTheDocument();
  });

  it("renders the source count and technical distance metadata", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(jsonResponse(successResponse));
    render(<App />);

    await user.click(screen.getByRole("button", { name: QUESTION }));
    const summary = await screen.findByText("View sources (1)");
    await user.click(summary);

    expect(screen.getByText("Retrieval distance: 0.5385")).toBeInTheDocument();
    expect(screen.queryByText(/confidence/i)).not.toBeInTheDocument();
  });

  it("renders every source including long filenames and content", async () => {
    const user = userEvent.setup();
    const longFilename = `${"technical-resume-".repeat(12)}.pdf`;
    const longContent = Array.from({ length: 80 }, () => "Architecture context").join(" ");
    fetchMock.mockResolvedValue(
      jsonResponse({
        ...successResponse,
        sources: [
          successResponse.sources[0],
          {
            chunkIndex: 14,
            distance: 0.712345,
            filename: longFilename,
            content: longContent,
          },
        ],
      }),
    );
    render(<App />);

    await user.click(screen.getByRole("button", { name: QUESTION }));
    await user.click(await screen.findByText("View sources (2)"));

    expect(screen.getByText(longFilename)).toBeInTheDocument();
    expect(screen.getByText(longContent)).toBeInTheDocument();
    expect(screen.getByText("Chunk 14")).toBeInTheDocument();
  });

  it("shows a user-friendly network failure", async () => {
    const user = userEvent.setup();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    render(<App />);

    await user.click(screen.getByRole("button", { name: QUESTION }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to reach the resume service",
    );
  });

  it("shows a user-friendly HTTP failure", async () => {
    const user = userEvent.setup();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    fetchMock.mockResolvedValue(jsonResponse({ message: "Internal details" }, false, 500));
    render(<App />);

    await user.click(screen.getByRole("button", { name: QUESTION }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("could not complete your request");
    expect(alert).not.toHaveTextContent("Internal details");
  });

  it("rejects a malformed response including invalid source fields", async () => {
    const user = userEvent.setup();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    fetchMock.mockResolvedValue(
      jsonResponse({
        question: QUESTION,
        answer: "An answer",
        sources: [{ chunkIndex: 0, distance: "near", content: "Missing filename" }],
      }),
    );
    render(<App />);

    await user.click(screen.getByRole("button", { name: QUESTION }));

    expect(await screen.findByRole("alert")).toHaveTextContent("unexpected response");
  });

  it("clears the in-memory question history", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(jsonResponse(successResponse));
    render(<App />);

    await user.click(screen.getByRole("button", { name: QUESTION }));
    await screen.findByText("direct PostgreSQL experience");
    await user.click(screen.getByRole("button", { name: "Clear history" }));

    expect(screen.queryByRole("heading", { name: QUESTION })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Explore the resume" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Clear history" })).not.toBeInTheDocument();
  });

  it("keeps completed questions in oldest-first chronological order", async () => {
    const user = userEvent.setup();
    const secondQuestion = "What AI technologies has Ramon worked with?";
    fetchMock
      .mockResolvedValueOnce(jsonResponse(successResponse))
      .mockResolvedValueOnce(
        jsonResponse({ ...successResponse, question: secondQuestion, answer: "AI experience" }),
      );
    render(<App />);

    await user.click(screen.getByRole("button", { name: QUESTION }));
    await screen.findByText("direct PostgreSQL experience");
    await user.click(screen.getByRole("button", { name: secondQuestion }));
    await screen.findByText("AI experience");

    const results = screen.getByRole("heading", { name: "Questions and answers" }).parentElement
      ?.parentElement;
    const questionHeadings = within(results!).getAllByRole("heading", { level: 3 });
    expect(questionHeadings.map((heading) => heading.textContent)).toEqual([
      QUESTION,
      secondQuestion,
    ]);
  });
});
