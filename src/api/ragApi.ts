import { getApiBaseUrl } from "../config/env";
import type { RagResponse, RagSource } from "../types/rag";

export type RagApiErrorCode =
  | "configuration"
  | "validation"
  | "network"
  | "http"
  | "malformed-response"
  | "cancelled";

export class RagApiError extends Error {
  constructor(
    public readonly code: RagApiErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "RagApiError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isRagSource(value: unknown): value is RagSource {
  return (
    isRecord(value) &&
    Number.isInteger(value.chunkIndex) &&
    typeof value.distance === "number" &&
    Number.isFinite(value.distance) &&
    typeof value.filename === "string" &&
    value.filename.trim().length > 0 &&
    typeof value.content === "string"
  );
}

function isRagResponse(value: unknown): value is RagResponse {
  return (
    isRecord(value) &&
    typeof value.question === "string" &&
    value.question.trim().length > 0 &&
    typeof value.answer === "string" &&
    value.answer.trim().length > 0 &&
    Array.isArray(value.sources) &&
    value.sources.every(isRagSource)
  );
}

function logDevelopmentError(context: string, error: unknown): void {
  if (import.meta.env.DEV) {
    console.error(context, error);
  }
}

export async function askResumeQuestion(
  question: string,
  signal?: AbortSignal,
): Promise<RagResponse> {
  const normalizedQuestion = question.trim();

  if (!normalizedQuestion) {
    throw new RagApiError("validation", "Enter a question before submitting.");
  }

  let apiBaseUrl: string;
  try {
    apiBaseUrl = getApiBaseUrl();
  } catch (error) {
    logDevelopmentError("Invalid frontend API configuration.", error);
    throw new RagApiError(
      "configuration",
      "The resume service is not configured. Please contact the site administrator.",
      { cause: error },
    );
  }

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/api/rag/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: normalizedQuestion }),
      signal,
    });
  } catch (error) {
    if (signal?.aborted || (error instanceof DOMException && error.name === "AbortError")) {
      throw new RagApiError("cancelled", "The request was cancelled.", { cause: error });
    }

    logDevelopmentError("RAG API network request failed.", error);
    throw new RagApiError(
      "network",
      "Unable to reach the resume service. Check your connection and try again.",
      { cause: error },
    );
  }

  if (!response.ok) {
    logDevelopmentError("RAG API returned an HTTP error.", {
      status: response.status,
      statusText: response.statusText,
    });
    throw new RagApiError(
      "http",
      "The resume service could not complete your request. Please try again.",
    );
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch (error) {
    logDevelopmentError("RAG API response was not valid JSON.", error);
    throw new RagApiError(
      "malformed-response",
      "The resume service returned an unexpected response. Please try again.",
      { cause: error },
    );
  }

  if (!isRagResponse(data)) {
    logDevelopmentError("RAG API response did not match the expected contract.", data);
    throw new RagApiError(
      "malformed-response",
      "The resume service returned an unexpected response. Please try again.",
    );
  }

  return data;
}
